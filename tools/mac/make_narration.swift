// make_narration.swift — records the Math 10C Practice explainer narration with a Mac voice.
//
//   swift make_narration.swift                      uses "Ryan's Personal Voice"
//   swift make_narration.swift "Ava (Premium)"      uses any other installed voice by name
//   swift make_narration.swift --list               lists the voices this Mac can use
//
// Run it from this folder. Reads lines.json and saves one clip per line into audio/<lesson>/<name>.m4a.
// Clips that already exist are skipped, so re-running only records new or changed lines.
import AVFoundation
import Foundation

setvbuf(stdout, nil, _IONBF, 0)

struct Line: Decodable { let file: String; let text: String }

let here = URL(fileURLWithPath: FileManager.default.currentDirectoryPath) // run from this folder
let args = Array(CommandLine.arguments.dropFirst())
let defaultVoice = "Ryan's Personal Voice"
let wanted = args.first(where: { !$0.hasPrefix("--") }) ?? defaultVoice
let outDir = here.appendingPathComponent("audio")
let fm = FileManager.default

func norm(_ s: String) -> String { s.replacingOccurrences(of: "\u{2019}", with: "'").lowercased() }

/// Keep the run loop turning (callbacks arrive on it) until `done()` or the timeout.
func wait(timeout: TimeInterval, _ done: () -> Bool) -> Bool {
    let end = Date().addingTimeInterval(timeout)
    while !done() && Date() < end { RunLoop.current.run(until: Date().addingTimeInterval(0.05)) }
    return done()
}

// ---- 1. permission to use Personal Voice ----
final class Box<T> { var value: T; init(_ v: T) { value = v } }
if #available(macOS 14.0, *) {
    print("Asking macOS for permission to use your Personal Voice — if a box pops up, click Allow…")
    let status = Box<AVSpeechSynthesizer.PersonalVoiceAuthorizationStatus?>(nil)
    AVSpeechSynthesizer.requestPersonalVoiceAuthorization { s in status.value = s }
    if !wait(timeout: 45, { status.value != nil }) { print("(no answer after 45 seconds — carrying on)") }
    switch status.value {
    case .some(.authorized): print("Personal Voice: allowed")
    case .some(.denied):
        print("Personal Voice: NOT allowed. In System Settings → Privacy & Security, find Personal Voice and allow Terminal, then run this again.")
    case .some(.unsupported): print("Personal Voice: not supported on this Mac.")
    default: print("Personal Voice: macOS didn't answer the permission request.")
    }
} else {
    print("Personal Voice needs macOS 14 (Sonoma) or newer.")
}

func isPersonalEarly(_ v: AVSpeechSynthesisVoice) -> Bool {
    if #available(macOS 14.0, *) { return v.voiceTraits.contains(.isPersonalVoice) }
    return false
}

// ---- 2. pick the voice ----
print("Looking for the voice \"\(wanted)\"…")
let voices = AVSpeechSynthesisVoice.speechVoices()
print("  this Mac offers \(voices.count) voices (\(voices.filter(isPersonalEarly).count) Personal Voice)")
func isPersonal(_ v: AVSpeechSynthesisVoice) -> Bool {
    if #available(macOS 14.0, *) { return v.voiceTraits.contains(.isPersonalVoice) }
    return false
}
if args.contains("--list") {
    for v in voices.sorted(by: { $0.name < $1.name }) where v.language.hasPrefix("en") {
        print("  \(v.name)  [\(v.language)]\(isPersonal(v) ? "  ← Personal Voice" : "")")
    }
    exit(0)
}
var found = voices.first(where: { norm($0.name) == norm(wanted) })
    ?? voices.first(where: { norm($0.name).contains(norm(wanted)) })
if found == nil && wanted == defaultVoice { found = voices.first(where: isPersonal) }
guard let voice = found else {
    print("\nCouldn't find a voice called \"\(wanted)\". English voices this Mac offers:")
    for v in voices.sorted(by: { $0.name < $1.name }) where v.language.hasPrefix("en") {
        print("  \(v.name)\(isPersonal(v) ? "  ← Personal Voice" : "")")
    }
    print("\nRun again with one of those names in quotes, e.g.  swift make_narration.swift \"Ava (Premium)\"")
    exit(1)
}
print("Voice: \(voice.name)\n")

// ---- 3. record every line ----
guard let data = try? Data(contentsOf: here.appendingPathComponent("lines.json")),
      let lines = try? JSONDecoder().decode([Line].self, from: data) else {
    print("Couldn't read lines.json — it should be in the same folder as this script."); exit(1)
}

final class Watcher: NSObject, AVSpeechSynthesizerDelegate {
    var finished = false
    func speechSynthesizer(_ s: AVSpeechSynthesizer, didFinish u: AVSpeechUtterance) { finished = true }
}
final class Job {
    var file: AVAudioFile?
    var frames: AVAudioFramePosition = 0
    var rate: Double = 0
    var ended = false
    var last = Date()
    var error: String?
}
print("Recording \(lines.count) lines into \(outDir.path)\n")
let synth = AVSpeechSynthesizer()
let watcher = Watcher()
synth.delegate = watcher

func record(_ text: String, to url: URL) -> String? {
    let tmp = url.deletingPathExtension().appendingPathExtension("partial.m4a")
    try? fm.removeItem(at: tmp)
    let u = AVSpeechUtterance(string: text)
    u.voice = voice
    u.rate = AVSpeechUtteranceDefaultSpeechRate
    let job = Job()
    watcher.finished = false
    synth.write(u) { buf in
        guard let pcm = buf as? AVAudioPCMBuffer else { return }
        job.last = Date()
        if pcm.frameLength == 0 { job.ended = true; return }
        do {
            if job.file == nil {
                let f = pcm.format
                job.rate = f.sampleRate
                let settings: [String: Any] = [
                    AVFormatIDKey: kAudioFormatMPEG4AAC,
                    AVSampleRateKey: f.sampleRate,
                    AVNumberOfChannelsKey: f.channelCount,
                    AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
                ]
                job.file = try AVAudioFile(forWriting: tmp, settings: settings,
                                           commonFormat: f.commonFormat, interleaved: f.isInterleaved)
            }
            try job.file!.write(from: pcm)
            job.frames += AVAudioFramePosition(pcm.frameLength)
        } catch {
            job.error = error.localizedDescription; job.ended = true
        }
    }
    // finished = empty final buffer, the delegate's didFinish, or (after some audio) a quiet gap
    _ = wait(timeout: 90) {
        job.ended || watcher.finished || (job.frames > 0 && Date().timeIntervalSince(job.last) > 2.0)
    }
    synth.stopSpeaking(at: .immediate)
    job.file = nil // closes the file
    if let e = job.error { try? fm.removeItem(at: tmp); return e }
    if job.frames == 0 { try? fm.removeItem(at: tmp); return "the voice produced no audio" }
    try? fm.removeItem(at: url)
    do { try fm.moveItem(at: tmp, to: url) } catch { return error.localizedDescription }
    return nil
}

var made = 0, skipped = 0, failed = 0
for (i, line) in lines.enumerated() {
    let url = outDir.appendingPathComponent(line.file)
    try? fm.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    if let a = try? fm.attributesOfItem(atPath: url.path), let n = a[.size] as? NSNumber, n.intValue > 0 {
        skipped += 1; continue
    }
    let t0 = Date()
    if let err = record(line.text, to: url) {
        failed += 1
        print(String(format: "%3d/%d  ✗ %@ — %@", i + 1, lines.count, line.file, err))
        if made == 0 && failed >= 3 {
            print("\nThe first few lines all failed, so stopping here. This voice may not allow saving audio to a file.")
            print("Try a different voice, e.g.  swift make_narration.swift --list   to see the choices.")
            exit(1)
        }
    } else {
        made += 1
        print(String(format: "%3d/%d  ✓ %@  (%.1fs)", i + 1, lines.count, line.file, Date().timeIntervalSince(t0)))
    }
}
print("\nDone: \(made) recorded, \(skipped) already there, \(failed) failed.")
print("The clips are in: \(outDir.path)")
if made > 0 { print("Tell Claude they're ready.") }
exit(failed > 0 ? 1 : 0)
