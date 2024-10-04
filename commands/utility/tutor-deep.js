const { SlashCommandBuilder } = require('discord.js');
const pb = require('../../utils/pocketbase.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tutor-deep')
    .setDescription('gives a deep dive into a tutor based on their tutor id')
    .addStringOption((option) =>
      option
        .setName('tutorid')
        .setDescription('the id to find in the db')
        .setRequired(true)
    ),
  async execute(interaction) {
    const tutorid = interaction.options.getString('tutorid');
    const sent = await interaction.reply({
      content: 'Awaiting database response...',
      fetchReply: true,
    });
    try {
      const tutor = await pb
        .collection('tutors')
        .getFirstListItem(`id="${tutorid}"`, (expand = 'classes'));
      if (!tutor) {
        interaction.editReply('No tutors found.');
        return;
      }
      async function printClass(c) {
        const record = await pb
          .collection('classes')
          .getFirstListItem(`id="${c}"`);
        return `${record.teacherName}(${record.courseName})`;
      }
      let classString = '';
      for (const c of tutor.classes) {
        classString += (await printClass(c)) + ', ';
      }
      const sessions = await pb
        .collection('sessions')
        .getFullList({ filter: `tutor="${tutorid}"` });
      const pastMonthSessions = sessions.filter(
        (s) =>
          s.datetime >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() &&
          s.datetime < new Date(Date.now()).toISOString() &&
          s.tutee !== '' &&
          s.tutee !== s.tutor
      );
      const upcomingSessions = sessions.filter(
        (s) =>
          s.datetime > new Date(Date.now()).toISOString() &&
          s.tutee !== '' &&
          s.tutee !== tutor.user
      );

      const dateHired = new Date(tutor.created);
      function convertTZ(date, tzString) {
        return new Date(
          (typeof date === 'string' ? new Date(date) : date).toLocaleString(
            'en-US',
            { timeZone: tzString }
          )
        );
      }

      interaction.editReply(
        `Tutor: ${tutor.name} - (${tutor.id})\nCompleted Sessions: ${
          pastMonthSessions.length
        } sessions\nUpcoming Sessions (with student): ${
          upcomingSessions.length
        } sessions\nIs NHS: ${
          tutor.isNHS ? 'Yes' : 'No'
        }\nClasses: ${classString}\nDate Hired: ${convertTZ(
          dateHired,
          'America/Los_Angeles'
        ).toDateString()}`
      );
    } catch (e) {
      console.error(e);
      interaction.editReply('Problem finding tutor. Please try again.');
    }
  },
};
