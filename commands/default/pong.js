const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("pong", async (message, bot) => {
	let time = Date.now();
	let msg = await message.channel.createMessage("Ping!");
	msg.edit(`Ping! \`${Date.now() - time}ms\``);
}, {
	type: "default",
	description: "Addon to ping command!"
});
