import { describe,expect,it } from "vitest"; import { analyzeJobText } from "./analyze";
describe("job analysis",()=>{it("matches only supplied verified skills",()=>{const result=analyzeJobText("Staff Engineer\nAcme\nRequirements: TypeScript and Rust",["TypeScript","React"]);expect(result.matchedSkills).toEqual(["TypeScript"]);expect(result.score).toBe(50);});});
