var g_username = "";
var g_role = "";

module.exports = {
	setUsername(username) {
		g_username = username;
	},
	setRole(role) {
		g_role = role;
	},
	getUsername() {
		return g_username;
	},
	getRole() {
		return g_role;
	}
	
}