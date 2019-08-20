import React, { Component } from 'react';
import './App.css'; 
class Person extends Component {
    state = {
        details: 
        [{
            no: 1, name: "Veerendra", city: "Hyderabad", copied: false
        }, {
            no: 2, name: "Kumar", city: "Sec", copied: false
        }, {
            no: 3, name: "Nagella", city: "Vizag", copied: false
        }],
    }

    handleClick = (id) => {
        if(this.state.details[id].copied) {
          return alert('Already copied, cannot copied again!');
        }
        let newState = [...this.state.details];

        let newId = {...newState[id]};
        newId.name = `copy of ${newId.name}`;

        let oldId = {...newState[id]};
        oldId.copied = true;

        newState[id] = newId;
        newState = [...newState.slice(0, id), oldId, ...newState.slice(id)];
        
        this.setState({
          details: newState
        })
    }
    render() {
        const details = this.state.details.map((details, id) => {
            return (
                <tr id={id} key = {id}>
                    <td>{id + 1}</td>
                    <td>{details.name}</td>
                    <td>{details.city}</td>
                    <td>
                        <button onClick={()=> this.handleClick(id)}>C</button>


                    </td>
                </tr>
            )
        })
        return (
            <div>
                <table border="1">
                    <tbody>
                        {details}
                    </tbody>
                </table>
            </div>
        )
    }
}



export default Person;
