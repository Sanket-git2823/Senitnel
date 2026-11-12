"""Optional LLM Client (Kimi API via TokenRouter / OpenAI-compatible endpoint)."""

from typing import Optional, Dict, Any
import httpx
from app.core.config import settings
from app.core.logging import logger

class LLMClient:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.base_url = settings.LLM_BASE_URL or "https://api.moonshot.cn/v1"
        self.model = settings.LLM_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def generate_explanation(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        """Optionally generates enhanced natural language explanation using LLM."""
        if not self.is_configured:
            return None

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.2
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.warning(f"LLM API returned status {res.status_code}: {res.text}")
                    return None
        except Exception as e:
            logger.warning(f"LLM client call failed: {e}. Falling back to deterministic template.")
            return None

llm_client = LLMClient()
