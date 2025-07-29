import { formatMonitor } from "../src/formatters/monitor";

describe("formatMonitor", () => {
  it("returns 'Enabled' for boolean true", () => {
    expect(formatMonitor(true)).toBe("Enabled");
  });

  it("returns 'Disabled' for boolean false", () => {
    expect(formatMonitor(false)).toBe("Disabled");
  });

  it("returns 'Disabled' for non-object, non-boolean", () => {
    expect(formatMonitor(123)).toBe("Disabled");
    expect(formatMonitor("foo")).toBe("Disabled");
    expect(formatMonitor(null)).toBe("Disabled");
  });

  it("returns markdown JSON for a full monitor object", () => {
    const monitor = {
      alert: true,
      platforms: ["Windows", "Linux"],
      bugzilla_notification_emails: ["a@b.com", "c@d.com"],
      lower_is_better: true,
      change_detection_technique: "cdf-squared",
      change_detection_args: ["threshold=0.85"],
    };
    const result = formatMonitor(monitor);
    expect(result).toContain("<pre><code>");
    expect(result).toContain('"alert": "Enabled"');
    expect(result).toContain(
      '"platforms": [\n    "Windows",\n    "Linux"\n  ]'
    );
    expect(result).toContain(
      '"bugzillaNotificationEmails": [\n    "a@b.com",\n    "c@d.com"\n  ]'
    );
    expect(result).toContain('"lowerIsBetter": true');
    expect(result).toContain('"changeDetectionTechnique": "cdf-squared"');
    expect(result).toContain(
      '"changeDetectionArgs": [\n    "threshold=0.85"\n  ]'
    );
    expect(result).toContain("</code></pre>");
  });

  it("returns markdown JSON with defaults for missing fields", () => {
    const monitor = { alert: false };
    const result = formatMonitor(monitor);
    expect(result).toContain('"alert": "Disabled"');
    expect(result).toContain('"platforms": []');
    expect(result).toContain('"bugzillaNotificationEmails": []');
    expect(result).toContain('"lowerIsBetter": null');
    expect(result).toContain('"changeDetectionTechnique": null');
    expect(result).toContain('"changeDetectionArgs": []');
  });
});
