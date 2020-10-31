import React, { Component } from 'react';
import { string } from 'yup';
import Form from './Form';

class HyperlinksParser extends Component {
  constructor(props) {
    super(props);
    this.table = React.createRef();
    this.state = {
      error: null,
      htmlText: '',
      isFetching: false,
      matches: null,
    };
  }

  loadHtmlText = url => {
    this.setState({
      isFetching: true,
    });
    fetch(url, {
      method: 'GET',
      'Content-type': 'text/html',
    })
      .then(response => response.text())
      .then(data => {
        this.setState({
          htmlText: data,
        });
        this.validateLinks();
      })
      .catch(error => {
        this.setState({
          error,
        });
      });
  };

  validateLinks() {
    const { htmlText } = this.state;
    const linkRegexp = /<a\s*\w*href="(?<link>(https?:\/\/)?(\w{3}\.)?\w+\.[\w.:/]*?)">(?<label>.*?)<\/a>/gim;

    const linksSchema = string().matches(linkRegexp, { excludeEmptyString: true });
    linksSchema
      .validate(htmlText)
      .then(value => {
        let validMatches = [];
        for (let match of value.matchAll(linkRegexp)) {
          validMatches.push(match.groups);
        }
        validMatches.length > 0
          ? this.setState({
              matches: validMatches,
              isFetching: false,
            })
          : this.setState({ isFetching: false });
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  handleSubmit = ({ values: { url } }) => {
    this.loadHtmlText(url);
  };

  render() {
    const { error, matches, isFetching } = this.state;
    const loading = (
      <tr>
        <td>{'Loading...'}</td>
        <td></td>
      </tr>
    );
    const noResult = (
      <tr>
        <td>{'No Result'}</td>
        <td></td>
      </tr>
    );

    return (
      <article>
        <Form onSubmit={this.handleSubmit} validationSchema={string().required().url()} />
        <section>
          <p>Example: "https://randomuser.me"</p>
          <p style={{ color: 'darkred' }}>{error ? error.message : ''}</p>
          <table>
            <thead>
              <tr>
                <th>Hyperlink Value</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody ref={this.table}>
              {matches
                ? matches.map((match, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <a href={match.link} target={'_blank'} rel={'noopener noreferrer'}>
                            {match.link}
                          </a>
                        </td>
                        <td>{match.label}</td>
                      </tr>
                    );
                  })
                : isFetching
                ? loading
                : noResult}
            </tbody>
          </table>
        </section>
      </article>
    );
  }
}

export default HyperlinksParser;
