var React = require('react');
var $ = require('jquery');

var UserList = React.createClass({
	render: function() {
		return(
			<div>
				<h1>User Data</h1>
				<button onClick={this.handleRefresh}>Refresh</button>
				<br/>
				<UserTable users={this.state.users} />
			</div>
		);
	},
	getInitialState: function() {
		return {users: []};
	},
	componentDidMount: function() {
		this.loadData({});
	},
	
	
	
	loadData: function(filter) {
		$.ajax('/api/users', {data:filter}).done(function(data) {
			this.setState({users: data});
		}.bind(this));
	},
	handleRefresh: function(e) {
		e.preventDefault();
		this.loadData({});
	}
});


var UserTable = React.createClass({
	render: function() {
		var userRows = this.props.users.map(function(user) {
			return <UserRow key={user._id} user={user} />
		});
		
		return(
			<table>
				<thead>
					<tr>
						<th>Username</th>
						<th>Role</th>
						<th>Switch</th>
					</tr>
				</thead>
				
				<tbody>
					{userRows}
				</tbody>
			</table>
		);
	}	
});

var UserRow = React.createClass({
	render: function() {
		return(
			<tr>
				<td>{this.state.username}</td>
				<td>{this.state.role}</td>
				<td><button onClick={this.handleSwitch} /></td>
			</tr>
		);
	},
	getInitialState: function() {
		return{
			username: this.props.user.username,
			role: this.props.user.role
		};
	},
	
	
	handleSwitch: function(e) {
		e.preventDefault();
		var switchedRole = this.switchRole(this.state.role);
		var user = { 
			username: this.state.username,
			role: switchedRole
		};
		
		$.ajax({
			type: 'POST', 
			url: '/api/switchRole', 
			contentType: 'application/json',
			data: JSON.stringify(user),
			success: function(data) {
				this.setState({
					role: switchedRole
				});
			}.bind(this),
			error: function(xhr, status, err) {
				console.log("(handleLogin)Callback error! ", err);
			}
		});
	},
	switchRole: function(role) {
		var result;
		
		if(role == "admin") {
			result = "user";
		} else {
			result = "admin";
		}
		return result;
	}
});

module.exports = UserList;