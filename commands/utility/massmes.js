const { SlashCommandBuilder } = require('discord.js');
const PocketBase = require("pocketbase/cjs");
const { sendToNumber, carriers } = require('../../notify');

const pb = new PocketBase("https://api.echo-edu.org");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('massmes')
        .setDescription('Sends a message to tutors of a certain class based on the class id')
        .addStringOption(option => option.setName('classid').setDescription('The ID of the class to send the message to').setRequired(true))
        .addStringOption(option => option.setName('text').setDescription('The text to send to the phone number').setRequired(true)),
    async execute(interaction) {
        const id = interaction.options.getString('classid');
        const text = interaction.options.getString('text');
        const sent = await interaction.reply({content: 'Sending...', fetchReply: true});

        if (!pb.authStore.model) {
            await pb.admins.authWithPassword(
              process.env.API_ADMIN_EMAIL,
              process.env.API_ADMIN_PASSWORD
            );
          }
        try {
            let records = await pb.collection('tutors').getFullList({
                expand: "user",
            });
            records = records.filter(record => record.classes.includes(id));
            if (records.length === 0) {
                interaction.editReply("No tutors for that class.");
                return;
            }
            let retString = "";
            for (const record of records) {
                const phone = await pb.collection('phones').getFirstListItem(`user="${record.expand.user.id}"`);
                const pNum = phone.number;
                const pCar = phone.carrier;
                retString += `Sending "${text}" to ${pNum}${carriers[pCar]}\n`
                console.log(carriers[pCar]);
                await sendToNumber(pNum, pCar, text);
            }
            interaction.editReply(`Messages:\n${retString}`);
        } catch (e) {
            console.error(e);
            interaction.editReply("Problem sending message. Please try again.");
        }
          
    }
};