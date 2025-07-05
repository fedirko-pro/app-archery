import { Link } from 'react-router-dom';

const About = () => (
  <section>
    <div className="container">
      <div className="content">
        <h2>About this App</h2>
        <p>This app is "multi-tool" for modern archer.</p>
        <p>Current functionality:</p>
        <ul>
          <li>Universal converter</li>
          <li>Link to portal</li>
          <li>"About" page</li>
        </ul>
        <p>Planned functionality:</p>
        <ul>
          <li>Training log</li>
          <li>Archers profile</li>
          <li>Possibility to share the profile</li>
          <li>Local competition</li>
          <li>Global competition</li>
          <li>Friendly challenges (duels)</li>
          <li>News</li>
          <li>Calendar</li>
          <li>Archery knowledge base</li>
        </ul>
        <hr />
        Regarding additional functionality (or other questions) drop me an email
        to <br />
        <Link to="mailto:serhii.fedirko@gmail.com">
          serhii.fedirko@gmail.com
        </Link>
        <hr />
        <p>
          © 2023{' '}
          <Link to="https://fedirko.pro" target="_blank">
            FEDIRKO.PRO
          </Link>
          . All rights reserved.
        </p>
      </div>
    </div>
  </section>
);

export default About;
