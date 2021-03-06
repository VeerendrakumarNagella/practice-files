import React from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import "@progress/kendo-theme-default/dist/all.css";
import { faPlusSquare, faSave } from "@fortawesome/free-solid-svg-icons";
import Button from "./../common/controls/button";
import { createNewProjectReducer } from "../../redux/Actions/createNewProject";
import { createNewCustomerReducer, getUserCustomers, getCustomersListReducer } from "../../redux/Actions/createNewCustomer";
import { connect } from "react-redux";
import { guid } from "../common/Utilities";
import { getProjectList } from "./../../redux/Actions/getProjectList";
import "./addproject.scss";
import axios from "axios";

import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { filterBy } from '@progress/kendo-data-query';


class AddProjectDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      custID: "",
      customerDetails: {},
      data: [],
      CustomerID: guid(),

      projectname: "Project " + this.getRandomProjectName(),
      CustomerEmail: "",
      CustomerPhone: "",
      CustomerName: "",
      inputDisabled: true,
      customerNameList: [],
      source: [],
      CustomerName2: '',

      visible: false,
      fields: {
        //projectname: "Project " + this.getRandomProjectName(),
        customername: "",
        contactname: "",
        emailid: "",
        mobileno: "",
        disablecustomerfields: true
      },
      details: [],
      errors: {},
      ProjectID: guid()
    };
    this.toggleprojectDialog = this.toggleprojectDialog.bind(this);
    this.getRandomProjectName = this.getRandomProjectName.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.submitCustomerListForm = this.submitCustomerListForm.bind(this);
  }

  toggleprojectDialog() {
    this.props.getUserCustomers();
    this.setState({
      visible: !this.state.visible,
      projectname: "Project " + this.getRandomProjectName(),
      errors: {},
      ProjectID: guid()
    });
    if (this.state.visible === false) {
      this.setState({
        CustomerEmail: "",
        CustomerPhone: "",
        CustomerName: "",
        fields: {
          customername: ""
        }
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
      if(this.props.userCustomers){
        const customerNameList = this.props.userCustomers.map(
          ({ CustomerName }) => CustomerName
        );
        if(prevProps.userCustomers != this.props.userCustomers){
            this.setState({
                customerNameList,
                source: customerNameList
            })
        }
      }

    if (this.props.userCustomers !== prevProps.userCustomers) {
      console.log("Data is", this.props.userCustomers);
      this.setState({
        data: this.props.userCustomers
      });
    }
  }

  getRandomProjectName() {
    var projectName = "";
    var randomNumber = 0;
    randomNumber = Math.floor(Math.random() * 10000);
    projectName = projectName + " " + randomNumber;
    return projectName;
  }
  submitCustomerListForm(e) {
    e.nativeEvent.preventDefault();

    if (this.state.inputDisabled === true) {
      if (this.validateForm(e.nativeEvent)) {
        this.props.createNewProjectReducer(
          this.state.ProjectID,
          this.state.projectname
        );
        this.toggleprojectDialog();
        this.props.getProjectList("sudheerkumar.tangudu@utc.com");
      }

      console.log("New project added:", this.state.inputDisabled);
    } else {
      //customerID, customerInformation,customerName,companyName
      if (this.validateForm(e.nativeEvent)) {
        this.props.createNewCustomerReducer(
          this.state.CustomerID,
          this.state.fields.customername,
          this.state.fields.customername,
          this.state.CustomerName
        );
        this.toggleprojectDialog();
        this.props.getProjectList("sudheerkumar.tangudu@utc.com");
      }
      console.log("New User added:", this.state.inputDisabled);
    }
  }
  handleChange = selectedName => {
    const value = selectedName;

    this.setState({
        customerNameList: this.filterData(value),
        CustomerName2: value
    });

    const selectedCustomer = this.state.data.filter(customer => customer.CustomerName === selectedName)[0];
    if(!selectedCustomer) {
        this.setState({
          CustomerEmail: "",
          CustomerPhone: "",
          CustomerName: "",
          inputDisabled: true
        });
        return;
    };

    const selectedID = selectedCustomer.CustomerID;

    axios({
      url:
        "https://ngecatapplicationservice.azurewebsites.net/api/Customer/GetCustomerAddressList?CustomerID=" +
        `${selectedID}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        XUsername: "sudheerkumar.tangudu@utc.com"
      }
    }).then(res => {
      if (!res.data.AddressList.length) {
        this.setState({
          CustomerEmail: "",
          CustomerPhone: "",
          CustomerName: "",
          inputDisabled: false
        });
      } else {
        res = res.data.AddressList[0];
        const { CustomerName } = this.state.data.filter(
          customer => customer.CustomerID == selectedID
        )[0];

        this.setState({
          CustomerEmail: res.Email,
          CustomerPhone: res.Phone,
          CustomerName,
          inputDisabled: true
        });
      }
    });
  };

    filterData(value) {
        const filter = {
            value: value,
            operator: 'startswith',
            ignoreCase: true
        };
        return value ? filterBy(this.state.source, filter) : this.state.source;
    }


  validateForm(e) {
    e.preventDefault();
    let fields = this.state;
    fields[e.target.name] = e.target.value;
    let errors = this.state.errors;
    let formIsValid = true;
    switch (e.target.name) {
      case "projectname":
        if (!fields["projectname"]) {
          formIsValid = false;
          errors["projectname"] = "*Please enter your projectname.";
        }
        if (typeof fields["projectname"] !== "undefined") {
          if (
            !fields["projectname"].match(
              /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/
            )
          ) {
            formIsValid = false;
            errors["projectname"] = "*Please enter alphabet characters only.";
          }
        }
        formIsValid && (errors["projectname"] = "");
        break;
      case "customername":
        if (!fields["customername"]) {
          formIsValid = false;
          errors["customername"] = "*Please enter your customername.";
        }
        if (typeof fields["customername"] !== "undefined") {
          //  console.log( "customers: ",this.props.getUserCustomersReducer);
          if (!fields["customername"].match(/^[a-zA-Z ]*$/)) {
            formIsValid = false;
            errors["customername"] = "*Please enter alphabet characters only.";
          }
        }
        formIsValid && (errors["customername"] = "");
        break;
      case "CustomerName":
        if (!fields["CustomerName"]) {
          formIsValid = false;
          errors["CustomerName"] = "*Please enter your contactname.";
        }
        if (typeof fields["CustomerName"] !== "undefined") {
          if (!fields["CustomerName"].match(/^[a-zA-Z ]*$/)) {
            formIsValid = false;
            errors["CustomerName"] = "*Please enter alphabet characters only.";
          }
        }
        formIsValid && (errors["CustomerName"] = "");
        break;

      case "CustomerEmail":
        if (!fields["CustomerEmail"]) {
          formIsValid = false;
          errors["CustomerEmail"] = "*Please enter your email-ID.";
        }
        if (typeof fields["CustomerEmail"] !== "undefined") {
          //regular expression for email validation
          var pattern = new RegExp(
            /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
          );
          if (!pattern.test(fields["CustomerEmail"])) {
            formIsValid = false;
            errors["CustomerEmail"] = "*Please enter valid email-ID.";
          }
        }
        formIsValid && (errors["CustomerEmail"] = "");
        break;
      case "CustomerPhone":
        if (!fields["CustomerPhone"]) {
          formIsValid = false;
          errors["CustomerPhone"] = "*Please enter your mobile no.";
        }

        if (typeof fields["CustomerPhone"] !== "undefined") {
          if (!fields["CustomerPhone"].match(/^[0-9]{10}$/)) {
            formIsValid = false;
            errors["CustomerPhone"] = "*Please enter valid mobile no.";
          }
        }
        formIsValid && (errors["CustomerPhone"] = "");
        break;
    }
    this.setState({
      errors: errors,
      fields
    });
    return formIsValid;
  }

  componentDidMount() {
      console.log('cdm ', this.state.data)
  }

  handleBlur = v =>{
    if(v.length){
        this.setState({
            inputDisabled: false
        })
    }
  }

  render() {
    

    return (
      <>
        <Button
          name="Add Project"
          icon={faPlusSquare}
          styles="eButton"
          onClick={this.toggleprojectDialog}
        />
        {this.state.visible && (
          <Dialog
            title={"New Project"}
            onClose={this.toggleprojectDialog}
            width={500}
          >
            <div className="card-block">
              <form name="CustomerListForm" className="k-form-inline">
                <label className="k-form-field">
                  <div className="dialog-dimensions">
                    {" "}
                    <span>Project Name</span>
                  </div>
                  <div className="message">
                    <input
                      className="k-textbox form-control"
                      placeholder="Project Name"
                      name="projectname"
                      value={this.state.projectname}
                      onChange={this.validateForm}
                    />
                    {/* // onChange={this.validateTextfields.bind(this)} /> */}
                    <span className="errorMsg">
                      {this.state.errors.projectname}
                    </span>
                  </div>
                </label>
                <label className="k-form-field ">
                  <div className="dialog-dimensions">
                    <span>Customer Name</span>
                  </div>
                  <div className="message">
                    <AutoComplete
                      data={this.state.customerNameList}
                      placeholder="Enter Name!"
                      value={this.state.CustomerName2}
                      className="form-control"
                      onChange={e => this.handleChange(e.target.value)}
                      onBlur={e => {
                        this.handleBlur(e.target.value)
                      }}
                    />
                  </div>
                </label>
                <label className="k-form-field">
                  <div className="dialog-dimensions">
                    <span>Contact Name</span>
                  </div>
                  <div className="message disable">
                    <input
                      className="k-textbox  form-control"
                      placeholder="Enter Name"
                      name="CustomerName"
                      value={this.state.CustomerName}
                      onChange={this.validateForm}
                      disabled={this.state.inputDisabled}
                    />
                    <span className="errorMsg">
                      {this.state.errors.CustomerName}{" "}
                    </span>
                  </div>
                </label>
                <label className="k-form-field">
                  <div className="dialog-dimensions">
                    {" "}
                    <span>Contact Email</span>
                  </div>
                  <div className="message disable">
                    <input
                      className="k-textbox  form-control"
                      placeholder="Enter Email"
                      name="CustomerEmail"
                      value={this.state.CustomerEmail}
                      onChange={this.validateForm}
                      disabled={this.state.inputDisabled}
                    />
                    <span className="errorMsg">
                      {this.state.errors.CustomerEmail}
                    </span>
                  </div>
                </label>

                <label className="k-form-field">
                  <div className="dialog-dimensions">
                    <span>Contact Number</span>
                  </div>
                  <div className="message disable">
                    <input
                      className="k-textbox  form-control "
                      placeholder="Enter Contact Number"
                      name="CustomerPhone"
                      value={this.state.CustomerPhone}
                      onChange={this.validateForm}
                      disabled={this.state.inputDisabled}
                    />
                    <span className="errorMsg">
                      {this.state.errors.CustomerPhone}
                    </span>
                  </div>
                </label>

                <div className="dialog-but">
                  <Button
                    name="Save"
                    icon={faSave}
                    styles="eButtonPrimary"
                    style={{ backgroundColor: "#152c73", color: "white" }}
                    onClick={this.submitCustomerListForm}
                  />
                  <Button
                    name="Save and add Selection"
                    icon={faSave}
                    styles="eButtonPrimary"
                    style={{ backgroundColor: "#152c73", color: "white" }}
                    onClick={this.toggleDialog}
                  />
                </div>
              </form>
            </div>
          </Dialog>
        )}
      </>
    );
  }
}

const mapStateToProps = state => {
  const userCustomers = state.getUserCustomers.records;
  return {
    createNewProjectReducer: state.createNewProjectReducer,
    createNewCustomerReducer: state.createNewCustomerReducer,
    userCustomers,
    createCustomerReducer: state.createCustomerReducer
  };
};

const mapPropsToDispatch = dispatch => props => ({
  UserCustomersReducer: dispatch => props.getUserCustomersReducer()
});

export default connect(
  mapStateToProps,
  {
    createNewCustomerReducer,
    createNewProjectReducer,
    getProjectList,
    getUserCustomers
  }
)(AddProjectDialog);

