var React = require('react');
var $ = require('jquery');

var Auth = require('../Auth.js');

var UserList = React.createClass({
	render: function() {
		// console.log("In userlist = ", Auth.getUsername());
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
		var td1 = (this.state.username != Auth.getUsername()) ?
			this.state.username
			: "";
		var td2 = (this.state.username != Auth.getUsername()) ?
			this.state.role
			: "";
		var td3 = (this.state.username != Auth.getUsername()) ?
			<button onClick={this.handleSwitch} />
			: "";
		return(
			<tr>
				<td>{td1}</td> 	
				<td>{td2}</td>
				<td>{td3}</td>
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