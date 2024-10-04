const { SlashCommandBuilder } = require('discord.js');

const { sendToNumber, carriers } = require('../../notify');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sms-message')
        .setDescription('Sends a message to a phone number')
        .addStringOption(option => option.setName('number').setDescription('The phone number to send the message to').setRequired(true))
        .addStringOption(option => option.setName('carrier').setDescription('The carrier of the phone number').setRequired(true))
        .addStringOption(option => option.setName('text').setDescription('The text to send to the phone number').setRequired(true)),
    async execute(interaction) {
        const number = interaction.options.getString('number');
        const carrier = interaction.options.getString('carrier');
        const text = interaction.options.getString('text');
        const sent = await interaction.reply({content: 'Sending...', fetchReply: true});
        if(carriers[carrier] === undefined) {
            interaction.editReply('Invalid carrier');
            return;
        }
        await sendToNumber(number, carrier, text);
        interaction.editReply(`Message sent to ${number}${carriers[carrier]}`);
    }
};