# Logging setup
import logging
logger = logging.getLogger(__name__)

# Need this to communicate with the other container
import httpx

# --------------------------------------------------------------------
# Class for communicating with the llama_api container server 
# --------------------------------------------------------------------
# Might need to get this endpoint URL from somewhere else and not have it be hardcoded like this...
class LlamaAPI:
    # Initialize with a given endpoint for the LLM API container
    def __init__(self, base_url="http://llama_api:11434"):
        self.base_url = base_url
        logger.info(f"Llama API LLM initialized, URL: {self.base_url}")

    # Call the LLM from the API container
    async def __call__(self, prompt, max_tokens=None, stop=None, echo=False):
        # Prepare input 
        llm_json = {"prompt": prompt, "max_tokens": max_tokens, "stop": stop, "echo": echo}

        # Get a response from the API
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(f"{self.base_url}/completion", json=llm_json)
                response.raise_for_status()
                return response.json()
        
        # On error...
        except httpx.HTTPError as e: 
            logger.error(f"LLM call failed: {e}")
            return {"error": str(e)}
        
        # --- Maybe make a default response to return here? ---
        return response.json()
    
