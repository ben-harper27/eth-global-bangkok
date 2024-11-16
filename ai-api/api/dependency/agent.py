import os
from langchain_core.messages import HumanMessage
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

private_key = """-----BEGIN EC PRIVATE KEY-----
MHcCAQEEICBKma3mBsGkqREQxb+/EJxJP+EEifdVQH0rWm+1jFkMoAoGCCqGSM49
AwEHoUQDQgAEBwg4lGpOKQxPLlhAC7nD4ykN/U7d9LwVOxAjmjt+xsS2uhS/2fTC
OvjZXB5OIXDXw5dgJw//GXfUGU39P17E9g==
-----END EC PRIVATE KEY-----"""

cdp_api_key_name = "organizations/b5c487bf-00c7-41a7-9b27-f7b0115c9663/apiKeys/d0737191-fb60-452a-9e9c-0ceab13c3a8c"

open_api_key = "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"

os.environ["CDP_API_KEY_PRIVATE_KEY"] = private_key
os.environ["CDP_API_KEY_NAME"] = cdp_api_key_name
os.environ["OPENAI_API_KEY"] = open_api_key
os.environ["NETWORK_ID"] = 'base-sepolia'

# Initialize CDP wrapper
cdp = CdpAgentkitWrapper()

# Create toolkit from wrapper
toolkit = CdpToolkit.from_cdp_agentkit_wrapper(cdp)

tools = toolkit.get_tools()
print("For your convenience, here are my various capabilities: ")
for tool in tools:
    print(" - ", tool.name)
print()

# Select a model
llm = ChatOpenAI(model="gpt-4o-mini")

# Create an agent with the tools
agent_executor = create_react_agent(llm, tools, state_modifier="Ask the user questions about Memenomics.")

# Function to interact with the agent
def ask_agent(question: str):
    for chunk in agent_executor.stream(
        {"messages": [HumanMessage(content=question)]},
        {"configurable": {"thread_id": "my_first_agent"}}
    ):
        if "agent" in chunk:
            print(chunk["agent"]["messages"][0].content)
        elif "tools" in chunk:
            print(chunk["tools"]["messages"][0].content)
        print("-------------------")

def ask_user_first_question(question: str):
    for chunk in agent_executor.stream(
        {"messages": [HumanMessage(content=question)]},
        {"configurable": {"thread_id": "my_first_agent"}}
    ):
        if "agent" in chunk:
            print(chunk["agent"]["messages"][0].content)
        elif "tools" in chunk:
            print(chunk["tools"]["messages"][0].content)
        print("-------------------")

# example_query = "Send 0.005 ETH to john2879.base.eth"

# Test the agent
if __name__ == "__main__":
    print("Hint: Type 'exit' to quit.\n")
    ask_user_first_question("Ask me a question that will help me deepen my understanding of Memecoins.")
    while True:
        user_input = input("\nYou: ")
        print("\n")
        if user_input.lower() == 'exit':
            break
        ask_agent(user_input + "and assuming I don't ask for you to initiate an action (i.e. deploy_nft, deploy_token, get_balance, get_wallet_details, mint_nft, register_basename, request_faucet_funds, trade, transfer, wow_buy_token, wow_create_token, or wow_sell_token) considering my answer please also ask a followup question to further my insights.")
