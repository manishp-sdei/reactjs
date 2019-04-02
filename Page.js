// General
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

//Redux Form
import { Field, reduxForm, formValueSelector, FieldArray } from 'redux-form';

// Style
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import {
  Grid,
  Button,
  Form,
  Row,
  FormGroup,
  Col,
  ControlLabel,
  FormControl,
  Modal
} from 'react-bootstrap';
import s from './ListPlaceStep1.css';

import * as FontAwesome from 'react-icons/lib/fa';

// Translation
import { injectIntl, FormattedMessage } from 'react-intl';

// Locale
import messages from '../../locale/messages';

import normalizeEveryThingIsOK from '../Booking/Card/normalize';
// Helpers
import validateStep3 from './validateStep3';

// Internal Components
import CustomCheckbox from '../CustomCheckbox';
import ListPlaceTips from '../ListPlaceTips';
import CustomFields from './CustomFields';

import updateStep3 from './updateStep3';

class Page extends Component {

  static propTypes = {
    initialValues: PropTypes.object,
    previousPage: PropTypes.func,
    nextPage: PropTypes.func,
    formErrors: PropTypes.object,
  };


  constructor(props) {
    super(props);
    // this.showFields = this.showFields.bind(this);
    this.state = {
      spaces: [],
      isDisabled: false,
      isShow: true,
      toggle: false,
      show: false,

    }
    this.arr = [];
    this.input;
  }

  componentDidMount() {
    const { formErrors, listingFields, defaultEvents, form } = this.props;
    if (formErrors != undefined) {
      if (formErrors.hasOwnProperty('syncErrors')) {
        this.setState({ isDisabled: true });
      } else {
        this.setState({ isDisabled: false });
      }
    }
    if (listingFields != undefined) {
      this.setState({
        spaces: listingFields.spaces,
        // id: defaultEvents.id,
      });
    }

  }

  componentWillReceiveProps(nextProps) {
    const { formErrors, listingFields, defaultEvents, form } = nextProps;
    if (formErrors != undefined) {
      if (formErrors.hasOwnProperty('syncErrors')) {
        this.setState({ isDisabled: true });
      } else {
        this.setState({ isDisabled: false });
      }
    }
    if (listingFields != undefined) {
      this.setState({
        spaces: listingFields.spaces,
        //id: defaultEvents.id,

      });
    }

  }

  handleClose = (e) => {
    this.setState({ show: false });
  }

  switching = (e,index) => {
    
    
    if (e.target.value == 'Other Please') {
      this.arr[index] = true; 
      this.setState({
        show: true,
        isShow: false
      });

    }
    else {
    }
  };
  checkboxGroup = ({ label, name, options, input }) => (
    <ul className={s.listContainer}>
      {options.map((option, index) => {
        if (option.isEnable === "1") {
          return (
            <li className={s.listContent} key={index}>
              <span className={s.checkBoxSection}>
                <CustomCheckbox
                  name={`${input.name}[${index}]`}
                  value={option.id}
                  checked={input.value.indexOf(option.id) !== -1}
                  onChange={event => {
                    const newValue = [...input.value];
                    if (event === true) {
                      newValue.push(option.id);
                    } else {
                      newValue.splice(newValue.indexOf(option.id), 1);
                    }
                    return input.onChange(newValue);
                  }}
                />
              </span>
              <span className={cx(s.checkBoxSection, s.checkBoxLabel)}>
                <label className={cx(s.checkboxLabel, s.noPadding)}>{option.itemName}</label>
              </span>
            </li>
          )
        }
      }
      )
      }
    </ul>
  );

  renderFormControlSelect = ({ input, label, meta: { touched, error }, children, className }) => {
	this.input = input
	const { formatMessage } = this.props.intl;
    return (
      <div>
        <FormControl componentClass="select" {...input} className={className} >
          {children}
        </FormControl>
      </div>
    )
  }

  renderFormControl = ({ input, label, type, meta: { touched, error }, className }) => {
    const { formatMessage } = this.props.intl;
    return (
      <div>
        {touched && error && <span className={s.errorMessage}>{formatMessage(error)}</span>}
        <FormControl {...input} placeholder={label} type={type} className={className} />
      </div>
    );
  }
  renderOthers = ({ fields, meta: { error, submitFailed } }) => {
    this.arr.push(false);

    const { formatMessage } = this.props.intl;
    return (
      <div>

        <div className={s.spaceTop4}>
          {
            fields.map((other, index) => (
              <div key={index}>
                <Row >
                  {this.state.isShow || !this.arr[index] || this.input[index]===''? (
                    <Col md={3} lg={3}>

                      <FormGroup className={s.formGroup}>
                        <ControlLabel className={s.landingLabel}>
                          <FormattedMessage {...messages.eventDescription} />
                        </ControlLabel>
    
                        <Field name={`${other}.description`}
                          component={this.renderFormControlSelect}
                          onChange={(e)=>this.switching(e,index)}
                          className={cx(s.formControlSelect, s.jumboSelect)}
                        >
                          <option value="Chair">{formatMessage(messages.chair)} </option>
                          <option value="Table">{formatMessage(messages.table)} </option>
                          <option value="Table Linen">{formatMessage(messages.tablelinen)} </option>
                          <option value="Tent">{formatMessage(messages.tent)} </option>
                          <option value="Dinnerware">{formatMessage(messages.dinnerware)} </option>
                          <option value="Other Please">{formatMessage(messages.otherPlease)} </option>
                        </Field>
                      
                      </FormGroup>
                    </Col>
                
                  ) : (

                      <Col md={3} lg={3}>
                        <FormGroup className={s.formGroup}>
                          <ControlLabel className={s.landingLabel}>
                            <FormattedMessage {...messages.eventDescription} />
                          </ControlLabel>
                          <Field name={`${other}.description`}
                            component={this.renderFormControl}
                            className={cx(s.formControlSelect, s.jumboSelect)}
                          >
                          </Field>
                        </FormGroup>
                      </Col>
                    )}
                  <Col md={3} lg={3}>
                    <FormGroup className={s.formGroup}>
                      <ControlLabel className={s.landingLabel}>
                        <FormattedMessage {...messages.eventMaxnumber} />
                      </ControlLabel>
                      <Field
                        name={`${other}.maxNumber`}
                        type="text"
                        component={this.renderFormControl}
                        className={cx(s.formControlInput, s.jumboSelect, s.formControlInputMaxWidth)}
                        />
                    </FormGroup>
                  </Col>
                  <Col md={3} lg={3}>
                    <FormGroup className={s.formGroup}>
                      <ControlLabel className={s.landingLabel}>
                        <FormattedMessage {...messages.eventCostPerItem} />
                      </ControlLabel>
                      <Field
                        name={`${other}.costPerItem`}
                        type="text"
                        label='0'
                        component={this.renderFormControl}
                        className={cx(s.formControlInput, s.jumboSelect, s.formControlInputMaxWidth)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3} lg={3}>
                    {/* <h6 className={cx(s.landingContentTitle, s.splitText)}>Others #{index + 1}</h6> */}
                    <span className={cx(s.closeIcon)} onClick={() => fields.remove(index)}>
                      <FontAwesome.FaClose />
                    </span>
                  </Col>
                </Row>

              </div>
            ))}
          <Col xs={12} sm={12} md={12} lg={12} className={cx(s.space3, s.noPadding)}>
            <Button type="button" className={cx(s.button, s.btnPrimaryBorder, s.btnlarge)} onClick={() => fields.push({})}>  {formatMessage(messages.additionals)}
            </Button>
          </Col>
        </div>

      </div>

    );

  }


  render() {
    const { handleSubmit, submitting, pristine, previousPage, nextPage, onSubmit } = this.props;
    const { spaces, isDisabled, id, supplies, description } = this.state;
    const { formErrors } = this.props;
    const { formatMessage } = this.props.intl;
    
    return (
      <Grid fluid>
        <Row className={s.full_container}>
          <Col xs={12} sm={7} md={7} lg={7} className={cx(s.landingContent, s.side)}>

            <div className={s.step_list}>
              <Col xs={12} sm={6} md={6} lg={6} className={cx(s.textLeft, s.noPadding)}>

                <h3 className={s.font_22}><FormattedMessage {...messages.eventSupplies} /></h3>
                <span className={s.description}><FormattedMessage {...messages.eventSubText} /></span>
              </Col>
            </div>
            <div>
              <Col xs={12} sm={6} md={6} lg={6} className={cx(s.textLeft, s.noPadding)}>

                <Button className={cx(s.button, s.shift, s.btnPrimaryBorder, s.btnlarge, s.pullLeft)} onClick={() => nextPage("booking-scenarios")}>
                  <FormattedMessage {...messages.skipPage} />
                </Button>
              </Col>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={s.landingMainContent}>

                <div className={s.spaceTop4}>  
                </div>
				<Col md={12} lg={12} >
                  <FieldArray name="others" component={this.renderOthers} ref="resolve" />
                </Col>
              </div>
              <FormGroup className={s.formGroup}>
                <Col xs={12} sm={12} md={12} lg={12} className={cx(s.noPadding, s.mar_btm_20)}>
                  <Button className={cx(s.button, s.btnPrimaryBorder, s.btnlarge, s.pullLeft, s.btn_grey)} onClick={() => previousPage("fees")}>
                    <FormattedMessage {...messages.back} />
                  </Button>
                  <Button className={cx(s.button, s.btnPrimary, s.btnlarge, s.width200)} onClick={() => nextPage("booking-scenarios")}>
                    <FormattedMessage {...messages.next} />
                    <img src="/images/avatar/Path 105@2x.png" />
                  </Button>
                </Col>
              </FormGroup>
            </form>
            <Modal show={this.state.show} onHide={this.handleClose}>
              <Modal.Header closeButton>
                <Modal.Title><FormattedMessage {...messages.eventsupply} /></Modal.Title>
              </Modal.Header>
              <Modal.Body><FormattedMessage {...messages.addanother} /></Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={this.handleClose}>
                <FormattedMessage {...messages.add} />
				</Button>
              </Modal.Footer>
            </Modal>
          </Col>
          <Col xs={12} sm={5} md={5} lg={5} className={cx(s.landingContent, s.pad_zero)} >
            <img src="/images/avatar/step_1.png" />
          </Col>
        </Row>
		</Grid>
    );
  }
}

Page = reduxForm({
  form: 'ListPlaceStep3', // a unique name for this form
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: validateStep3,
  onSubmit: updateStep3
})(Page);

const mapState = (state) => ({
  userData: state.account.data,
  formErrors: state.form.ListPlaceStep1,
  listingFields: state.listingFields.data,
});

const mapDispatch = {
};

export default injectIntl(withStyles(s)(connect(mapState, mapDispatch)(Page)));