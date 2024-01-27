import os

import discord
from discord.ext import commands
from discord import app_commands

from pocketbase import PocketBase
# from pocketbase.client import FileUpload

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

from dotenv import load_dotenv

import logging

handler = logging.FileHandler(filename='discord.log', encoding='utf-8', mode='w')


load_dotenv()

TOKEN = os.getenv('DISCORD_TOKEN')
GUILD = os.getenv('DISCORD_GUILD')
ADMIN_EMAIL = os.getenv('API_ADMIN_EMAIL')
ADMIN_PASSWORD = os.getenv('API_ADMIN_PASSWORD')

client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)


pb = PocketBase('https://api.echo-edu.org')
print(f"Admin email: {ADMIN_EMAIL}, password: {ADMIN_PASSWORD}")
admin_data = pb.admins.auth_with_password(ADMIN_EMAIL, ADMIN_PASSWORD)

# losers get pb's in the gym
# vidhu gets pb's in vscode
def data_col(data):
    print(data.record.tutee)
    result = pb.collection('users').get_one(data.record.tutee)
    print('weewooweewoo')
    print(result)
    print(result.email)
    

pb.collection('sessions').subscribe(data_col)

@client.event
async def on_ready():
    
    for guild in client.guilds:
        if guild.id == GUILD:
            break

    await tree.sync(guild=discord.Object(id=int(GUILD)))
    print(
        f'{client.user} is connected to the following guild:\n'
        f'{guild.name}(id: {guild.id})'
    )


@tree.command(
    name="ping",
    description="Ping pong",
    guild=discord.Object(id=int(GUILD))
)

async def ping(interaction):
    await interaction.response.send_message(f"Pong! - {round(client.latency * 1000)}ms")



client.run(TOKEN, log_handler=handler, log_level=logging.DEBUG)