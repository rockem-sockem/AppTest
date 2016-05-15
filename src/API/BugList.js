var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

var BugFilter = require('./BugFilter');
var BugAdd = require('./BugAdd');


var BugRow = React.createClass({	
  render: function() {
    // console.log("Rendering BugRow:", this.props.bug);
	// console.log("genre is ", this.props.bug.genres);
    return (
      <tr>
        <td>{this.props.bug._id}</td>
		<td>{this.props.ranking}</td>
        <td>{this.props.bug.title}</td>
        <td>{this.props.bug.developer}</td>
        <td>{this.props.bug.price}</td>
        <td>{this.props.bug.genres}</td>
        <td>{this.props.bug.devices}</td>
      </tr>
    )
  }
});

var BugTable = React.createClass({
  render: function() {
    // console.log("Rendering bug table, num items:", this.props.bugs.length);
	var counter = 0;
    var bugRows = this.props.bugs.map(function(bug) {
      return <BugRow key={bug._id} bug={bug} ranking={++counter} />
    });
    return (
      <table>
        <thead>
          <tr>
            <th>ID</th>
			<th>Rank</th>
            <th>Title</th>
            <th>Developer</th>
            <th>Price</th>
            <th>Category</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          {bugRows}
        </tbody>
      </table>
    )
  }
});

var BugList = React.createClass({
  getInitialState: function() {
    return {bugs: []};
  },
  render: function() {
    // console.log("Rendering bug list, num items:", this.state.bugs.length);
    return (
      <div>
        <h1>Bug Tracker</h1>
        <BugFilter submitHandler={this.loadData} />
        <hr />
        <BugTable bugs={this.state.bugs}/>
        <hr />
        <BugAdd addBug={this.addBug} />
      </div>
    )
  },

  componentDidMount: function() {
    this.loadData({});
  },
  loadData:function(filter) {
    $.ajax('/api/bugs', {data:filter}).done(function(data) {
      this.setState({bugs: data});
    }.bind(this));
    // In production, we'd also handle errors.
  },

  addBug: function(bug) {
    // console.log("Adding bug:", bug);
    $.ajax({
      type: 'POST', url: '/api/bugs', contentType: 'application/json',
      data: JSON.stringify(bug),
      success: function(data) {
        var bug = data;
        // We're advised not to modify the state, it's immutable. So, make a copy.
        var bugsModified = this.state.bugs.concat(bug);
        this.setState({bugs: bugsModified});
      }.bind(this),
      error: function(xhr, status, err) {
        // ideally, show error to user.
        console.log("Error adding bug:", err);
      }
    });
  }
});

module.exports = BugList;
