// make_narration.swift — records the Math 10C Practice explainer narration with a Mac voice.
//
//   swift make_narration.swift --siri                 the Mac's system voice (set it to Siri Voice 4 in
//                                                     System Settings → Accessibility → Spoken Content)
//   swift make_narration.swift "Evan (Enhanced)"      any installed voice by name
//   swift make_narration.swift --personal             Ryan's Personal Voice (Apple may not allow saving it)
//   add --test to record just the first line to test.m4a and play it
//   swift make_narration.swift --list                 lists the voices this Mac can use
//
// Run it from this folder. Reads lines.json and saves one clip per line into audio/<lesson>/<name>.m4a.
// Clips that already exist are skipped, so re-running only records new or changed lines.
import AVFoundation
import Foundation

setvbuf(stdout, nil, _IONBF, 0)

struct Line: Decodable { let file: String; let text: String }

let here = URL(fileURLWithPath: FileManager.default.currentDirectoryPath) // run from this folder
let args = Array(CommandLine.arguments.dropFirst())
let usePersonal = args.contains("--personal")
let useSystem = args.contains("--siri") || args.contains("--system")
let testOnly = args.contains("--test")
let named = args.first(where: { !$0.hasPrefix("--") })
let outDir = here.appendingPathComponent("audio")
let fm = FileManager.default

func norm(_ s: String) -> String { s.replacingOccurrences(of: "\u{2019}", with: "'").lowercased() }

/// Keep the run loop turning (callbacks arrive on it) until `done()` or the timeout.
func wait(timeout: TimeInterval, _ done: () -> Bool) -> Bool {
    let end = Date().addingTimeInterval(timeout)
    while !done() && Date() < end { RunLoop.current.run(until: Date().addingTimeInterval(0.05)) }
    return done()
}
@discardableResult
func run(_ tool: String, _ a: [String]) -> (Int32, String) {
    let p = Process(); p.executableURL = URL(fileURLWithPath: tool); p.arguments = a
    let pipe = Pipe(); p.standardOutput = pipe; p.standardError = pipe
    do { try p.run() } catch { return (-1, error.localizedDescription) }
    let out = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
    p.waitUntilExit()
    return (p.terminationStatus, out.trimmingCharacters(in: .whitespacesAndNewlines))
}
func size(_ url: URL) -> Int { ((try? fm.attributesOfItem(atPath: url.path))?[.size] as? NSNumber)?.intValue ?? 0 }

guard let data = try? Data(contentsOf: here.appendingPathComponent("lines.json")),
      let lines = try? JSONDecoder().decode([Line].self, from: data) else {
    print("Couldn't read lines.json — it should be in the same folder as this script."); exit(1)
}

if args.contains("--list") {
    let (_, out) = run("/usr/bin/say", ["-v", "?"])
    print("Voices you can use by name (English):")
    for l in out.split(separator: "\n") where l.contains("en_") || l.contains("en-") { print("  " + l.split(separator: "#")[0].trimmingCharacters(in: .whitespaces)) }
    print("\nSiri voices don't appear here: choose one as the System Voice in Accessibility → Spoken Content, then use --siri.")
    exit(0)
}

/// Record with macOS's `say` (system voice when name is nil), then convert to AAC .m4a.
func recordWithSay(_ text: String, to url: URL, voice: String?) -> String? {
    let aiff = url.deletingPathExtension().appendingPathExtension("partial.aiff")
    let tmp = url.deletingPathExtension().appendingPathExtension("partial.m4a")
    try? fm.removeItem(at: aiff); try? fm.removeItem(at: tmp)
    var a: [String] = []
    if let v = voice { a += ["-v", v] }
    a += ["-o", aiff.path, text]
    let (rc, out) = run("/usr/bin/say", a)
    if rc != 0 { try? fm.removeItem(at: aiff); return "say failed: " + (out.isEmpty ? "code \(rc)" : out) }
    if size(aiff) < 8000 { try? fm.removeItem(at: aiff); return "the voice produced no audio" }
    let (rc2, out2) = run("/usr/bin/afconvert", ["-f", "m4af", "-d", "aac", "-b", "64000", aiff.path, tmp.path])
    try? fm.removeItem(at: aiff)
    if rc2 != 0 || size(tmp) == 0 { try? fm.removeItem(at: tmp); return "couldn't convert to m4a: " + out2 }
    try? fm.removeItem(at: url)
    do { try fm.moveItem(at: tmp, to: url) } catch { return error.localizedDescription }
    return nil
}

final class Box<T> { var value: T; init(_ v: T) { value = v } }

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
    var calls = 0
}

var record: (String, URL) -> String? = { _, _ in "no voice chosen" }
if !usePersonal {
    if useSystem {
        let (_, sel) = run("/usr/bin/defaults", ["read", "com.apple.Accessibility", "SpeechVoiceIdentifierForLanguage"])
        let hint = sel.lowercased().contains("siri") ? " (looks like a Siri voice ✓)" : ""
        print("Voice: the Mac's System Voice\(hint) — set in System Settings → Accessibility → Spoken Content\n")
        record = { recordWithSay($0, to: $1, voice: nil) }
    } else {
        let v = named ?? "Evan (Enhanced)"
        let (_, out) = run("/usr/bin/say", ["-v", "?"])
        let names = out.split(separator: "\n").map { String($0.split(separator: "#")[0]).trimmingCharacters(in: .whitespaces) }
        let hit = names.first(where: { norm($0).hasPrefix(norm(v)) })
        guard let voiceName = hit.map({ n -> String in
            // `say -v ?` pads names with the language code; keep just the name part
            if let r = n.range(of: #"\s+[a-z]{2,3}_[A-Za-z0-9_]+$"#, options: .regularExpression) { return String(n[..<r.lowerBound]) }
            return n }) else {
            print("Couldn't find a voice called \"\(v)\". If it's an Enhanced or Premium voice, download it first in")
            print("System Settings → Accessibility → Spoken Content → System Voice → Manage Voices. Then run again.")
            print("To see the voices you have:  swift make_narration.swift --list")
            exit(1)
        }
        print("Voice: \(voiceName)\n")
        record = { recordWithSay($0, to: $1, voice: voiceName) }
    }
} else {
    // ---- 1. permission to use Personal Voice ----
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
    let wanted = named ?? "Ryan's Personal Voice"
    print("Looking for the voice \"\(wanted)\"…")
    let voices = AVSpeechSynthesisVoice.speechVoices()
    print("  this Mac offers \(voices.count) voices (\(voices.filter(isPersonalEarly).count) Personal Voice)")
    func isPersonal(_ v: AVSpeechSynthesisVoice) -> Bool {
        if #available(macOS 14.0, *) { return v.voiceTraits.contains(.isPersonalVoice) }
        return false
    }
    var found = voices.first(where: { norm($0.name) == norm(wanted) })
        ?? voices.first(where: { norm($0.name).contains(norm(wanted)) })
    if found == nil { found = voices.first(where: isPersonal) }
    guard let voice = found else {
        print("\nCouldn't find a voice called \"\(wanted)\". English voices this Mac offers:")
        for v in voices.sorted(by: { $0.name < $1.name }) where v.language.hasPrefix("en") {
            print("  \(v.name)\(isPersonal(v) ? "  ← Personal Voice" : "")")
        }
        print("\nRun again with one of those names in quotes, e.g.  swift make_narration.swift \"Ava (Premium)\"")
        exit(1)
    }
    print("Voice: \(voice.name)\n")

    let synth = AVSpeechSynthesizer()
    let watcher = Watcher()
    synth.delegate = watcher

    func recordPersonal(_ text: String, to url: URL) -> String? {
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
            job.calls += 1
            if pcm.frameLength == 0 { if job.frames > 0 { job.ended = true }; return }
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
        if job.frames == 0 { try? fm.removeItem(at: tmp); return "the voice produced no audio (\(job.calls) empty buffers)" }
        try? fm.removeItem(at: url)
        do { try fm.moveItem(at: tmp, to: url) } catch { return error.localizedDescription }
        return nil
    }

    record = recordPersonal
}

if testOnly {
    let url = here.appendingPathComponent("test.m4a")
    print("Test: recording the first line to test.m4a…")
    if let err = record(lines[0].text, url) { print("✗ \(err)"); exit(1) }
    print("✓ saved test.m4a — playing it now…")
    run("/usr/bin/afplay", [url.path])
    print("If that sounds right, run again without --test to record everything.")
    exit(0)
}
print("Recording \(lines.count) lines into \(outDir.path)\n")
var made = 0, skipped = 0, failed = 0
for (i, line) in lines.enumerated() {
    let url = outDir.appendingPathComponent(line.file)
    try? fm.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    if let a = try? fm.attributesOfItem(atPath: url.path), let n = a[.size] as? NSNumber, n.intValue > 0 {
        skipped += 1; continue
    }
    let t0 = Date()
    if let err = record(line.text, url) {
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
