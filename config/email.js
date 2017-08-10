var generator = require('xoauth2').createXOAuth2Generator({
    user: 'arketops1@gmail.com',
    clientId: '239256089184-vac8fmu9is2sog4rs9kj4ujo06cpjts1.apps.googleusercontent.com',
    clientSecret: '6mL7401HElGwJZmlXfj_xjJA',
    refreshToken: '1/pVY9lCvKY4E-NVqhWs02VCSzPcY4hqQK0B7cogRcr0dtQLmopQ5ibFzXKG1A6ePZ',
    accessToken: 'ya29.GlucBH9-AXLAqP055Na4Uvqe1vr3oqMlDuKwgCGDWl-tdDYFkhSHPIAsedSRht2A0yUXT9Jv4dn3c_ZFjxvQ64hUxbXYswIiukpVKrcSni3HQO0FVHt6cSX8EpZF' // optional
});
module.exports.email = {
	 service: "Gmail",
	 auth: {
		 xoauth2:generator
	 },
	 templateDir: "api/emailTemplates",
	 from: "arketops1@gmail.com",
	 testMode: false,
	 ssl: true

};
