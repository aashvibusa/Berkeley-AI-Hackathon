from letta_client import Letta, MessageCreate, TextContent

client = Letta(
    token="sk-let-ZjdhMTYxODEtMzg4Mi00Y2VjLWExYmQtNzg1YzViYjE4ODBhOmRjOTkyMWU3LTM5NGItNDNiYi1iMDg1LThkZTExYzc5ZTEyYQ==",
)
client.agents.messages.create(
    agent_id="agent-cbe444ec-7c5e-41e6-a384-0bb98c8c7169",
    messages=[
        MessageCreate(
            role="user",
            content=[
                TextContent(
                    text="text",
                )
            ],
        )
    ],
)
