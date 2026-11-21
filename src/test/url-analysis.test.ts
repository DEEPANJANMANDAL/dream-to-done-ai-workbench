import { describe, expect, it } from "vitest";
import { analyzeUrl, detectBrand, isPrivateHost } from "@/lib/url-analysis";

const status = (url: string, id: string) => analyzeUrl(url)?.checks.find((c) => c.id === id)?.status;

describe("URL scanner rules", () => {
  it("flags a look-alike SBI domain", () => {
    expect(detectBrand("sbi-kyc-update.online")).toMatchObject({ name: "State Bank of India", official: false });
  });

  it("treats the official SBI domain as genuine", () => {
    expect(detectBrand("www.onlinesbi.sbi")).toMatchObject({ official: true });
  });

  it("flags a misspelled HDFC bank domain", () => {
    expect(detectBrand("hdfcbnak.com")?.official).toBe(false);
  });

  it("does not treat Amazon's own cloud domain as an imitation", () => {
    expect(detectBrand("s3.amazonaws.com")?.official).toBe(true);
  });

  it("warns about link shorteners", () => {
    expect(status("bit.ly/3xYzAbc", "shortener")).toBe("warn");
  });

  it("fails raw IP address links", () => {
    expect(status("http://45.12.8.9/login", "ip")).toBe("fail");
  });

  it("fails punycode look-alike domains", () => {
    expect(status("https://xn--sbi-bnk.com", "homograph")).toBe("fail");
  });

  it("fails direct .apk downloads", () => {
    expect(status("https://wedding-card.site/invite.apk", "apk")).toBe("fail");
  });

  it("blocks server probes of private network addresses", () => {
    expect(isPrivateHost("192.168.1.1")).toBe(true);
    expect(isPrivateHost("localhost")).toBe(true);
    expect(isPrivateHost("onlinesbi.sbi")).toBe(false);
  });
});
