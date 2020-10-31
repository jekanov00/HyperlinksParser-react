import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isSchema, string } from 'yup';

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      urlValue: '',
      error: null,
    };
  }

  handleChange = ({ target: { value } }) => {
    this.setState({
      urlValue: value,
    });
  };

  handleSubmit = e => {
    e.preventDefault();

    const { onSubmit, validationSchema } = this.props;
    const { urlValue } = this.state;

    validationSchema
      .validate(urlValue)
      .then(value => {
        onSubmit({
          values: {
            url: value,
          },
          event: e,
        });
        this.setState({
          error: null,
        });
      })
      .catch(error => {
        this.setState({
          error,
        });
      })
      .finally(() => {
        this.setState({
          urlValue: '',
        });
      });
  };

  render() {
    const { urlValue, error } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" value={urlValue} onChange={this.handleChange} placeholder="site url" />
        {error && <span>{error.message}</span>}
        <br />
        <button type="submit">parse hyperlink</button>
      </form>
    );
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  validationSchema: function (props, propName, componentName) {
    if (!isSchema(props[propName])) {
      return new Error('validationSchema prop must be Yup schema');
    }
  },
};

Form.defaultProps = {
  validationSchema: string().url().required(),
};

export default Form;
