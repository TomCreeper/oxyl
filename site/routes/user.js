const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

async function getDesc(user) {
	let query = `SELECT \`VALUE\` FROM \`Description\` WHERE \`USER\` = '${user}'`;
	let data = await framework.dbQuery(query);

	if(data && data[0]) return data[0].VALUE;
	else return "None set";
}

async function resetDesc(user) {
	return await framework.dbQuery(`DELETE FROM \`Description\` WHERE \`USER\` = '${user}'`);
}

async function setDesc(user, value) {
	if(value === "None set") return false;

	let desc = await getDesc(user);
	if(desc === "None set") return await framework.dbQuery(`INSERT INTO \`Description\`(\`USER\`, \`VALUE\`) VALUES ('${user}',${framework.sqlEscape(value)})`);
	else return await framework.dbQuery(`UPDATE \`Description\` SET \`VALUE\`=${framework.sqlEscape(value)} WHERE \`USER\` = '${user}'`);
}

router.get("/update", async (req, res) => {
	res.redirect("http://minemidnight.work/user/");
});

router.post("/update", async (req, res) => {
	let ip = main.getIp(req);

	if(main.tokens[ip]) {
		let loggedUser = await main.getInfo(main.tokens[ip], "users/@me");

		if(req.body.reset) await resetDesc(loggedUser.id);
		else if(req.body.desc) await setDesc(loggedUser.id, req.body.desc);
		res.redirect(`http://minemidnight.work/user/${loggedUser.id}`);
	} else {
		res.redirect(`http://minemidnight.work/user`);
	}
});

router.get("*", async (req, res) => {
	let ip = main.getIp(req), data = {};
	let user = req.path.substring(1);

	if(Oxyl.bot.users.has(user)) {
		user = Oxyl.bot.users.get(user);
		user.shared = Oxyl.bot.guilds.filter(guild => guild.members.has(user.id)).length;
		user.description = await getDesc(user.id);
		data.viewUser = user;

		if(main.tokens[ip]) {
			let loggedUser = await main.getInfo(main.tokens[ip], "users/@me");
			if(loggedUser.id === user.id) data.desc = true;
		}
	}

	res.send(await main.parseHB("user", req, data));
});

module.exports = router;
