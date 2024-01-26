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

client = PocketBase('http://127.0.0.1:8090')

admin_data = client.admins.auth_with_password(ADMIN_EMAIL, ADMIN_PASSWORD)

result = client.collection("sessions").get_list(1, 20, {
    "sort": '-created',
})

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