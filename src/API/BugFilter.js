var React = require('react');
var ReactDOM = require('react-dom');

var BugFilter = React.createClass({
  render: function() {
    // console.log("Rendering BugFilter");
    return (
      <div>
        <h3>Filter</h3>
        Title:
        <input type ="text" value={this.state.title} onChange={this.onChangeTitle}></input>
        <br/>
        Developer:
        <input type ="text" value={this.state.devleoper} onChange={this.onChangeDeveloper}></input>
        <br/>
        <button onClick={this.submit}>Apply</button>
      </div>
      )
  },

  getInitialState: function() {
    return {title: "", developer: ""};
  },

  onChangeTitle: function(e) {
    this.setState({title: e.target.value});
  },
  onChangeDeveloper: function(e) {
    this.setState({developer: e.target.value});
  },
  submit: function(e){
    this.props.submitHandler({title:this.state.title, developer:this.state.developer});
  }
});

module.exports = BugFilter;