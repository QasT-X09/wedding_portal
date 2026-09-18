---
name: "fcc-council"
description: "Offload token-heavy coding, analysis, and peer reviews to the local Free Claude Code (FCC) gateway (Gemini 3.6 Flash, Mistral Codestral)"
---

# fcc-council

Use this skill when offloading heavy computation, code generation, refactoring, or multi-perspective review to the local FCC API Gateway (`http://127.0.0.1:8082`).

## Execution Methods

### 1. Multi-Model Council (Consensus Review)
Runs Gemini 3.6 Flash and Mistral Codestral in parallel and returns synthesized feedback:
```powershell
python C:\Users\ASUS\fcc_agent_tools.py --council "<prompt or code>"
```

### 2. Specialized Codestral (Code Optimization)
```powershell
python C:\Users\ASUS\fcc_agent_tools.py --model codestral "<coding prompt>"
```

### 3. Specialized Gemini 3.6 Flash (High-Speed Analysis & Architecture)
```powershell
python C:\Users\ASUS\fcc_agent_tools.py --model gemini "<analysis prompt>"
```

## Subagent Integration
You can invoke the `fcc_council` subagent to handle deep analysis without consuming main turn tokens:
```python
invoke_subagent(
    TypeName="fcc_council",
    Role="Multi-Model Code Reviewer",
    Prompt="Analyze and optimize the target module..."
)
```
