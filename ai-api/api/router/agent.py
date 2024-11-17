import logging
from fastapi import APIRouter
from langchain_core.messages import HumanMessage
import os
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from api.settings import secure_settings
log = logging.getLogger(__name__)
router = APIRouter(
    prefix="/v1/agent",
    tags=["Agent"]
)

private_key = """-----BEGIN EC PRIVATE KEY-----
MHcCAQEEICBKma3mBsGkqREQxb+/EJxJP+EEifdVQH0rWm+1jFkMoAoGCCqGSM49
AwEHoUQDQgAEBwg4lGpOKQxPLlhAC7nD4ykN/U7d9LwVOxAjmjt+xsS2uhS/2fTC
OvjZXB5OIXDXw5dgJw//GXfUGU39P17E9g==
-----END EC PRIVATE KEY-----"""

cdp_api_key_name = "organizations/b5c487bf-00c7-41a7-9b27-f7b0115c9663/apiKeys/d0737191-fb60-452a-9e9c-0ceab13c3a8c"

os.environ["CDP_API_KEY_PRIVATE_KEY"] = private_key
os.environ["CDP_API_KEY_NAME"] = cdp_api_key_name
os.environ["OPENAI_API_KEY"] = secure_settings.open_api_key
os.environ["NETWORK_ID"] = 'base-sepolia'

# Initialize CDP wrapper
cdp = CdpAgentkitWrapper()

# Create toolkit from wrapper
toolkit = CdpToolkit.from_cdp_agentkit_wrapper(cdp)

tools = toolkit.get_tools()

# Select a model
llm = ChatOpenAI(model="gpt-4o-mini")

# Create an agent with the tools
agent_executor = create_react_agent(llm, tools, state_modifier="Ask the user questions about Memenomics.")

@router.get("/")
async def ask_user_first_question():
    for chunk in agent_executor.stream(
        {"messages": [HumanMessage(
            content="Ask me a question that will help me deepen my understanding of Memecoins.")]},
        {"configurable": {"thread_id": "my_first_agent"}}
    ):
        if "agent" in chunk:
            return chunk["agent"]["messages"][0].content
        elif "tools" in chunk:
            return chunk["tools"]["messages"][0].content
    return "-------------------"


def ask_agent(question: str):
    for chunk in agent_executor.stream(
        {"messages": [HumanMessage(content=question)]},
        {"configurable": {"thread_id": "my_first_agent"}}
    ):
        if "agent" in chunk:
            return chunk["agent"]["messages"][0].content
        elif "tools" in chunk:
            return chunk["tools"]["messages"][0].content
    return "-------------------"


@router.post("/")
async def agent(user_input: str):
    return ask_agent(user_input)
