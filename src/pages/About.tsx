import { Link } from 'react-router-dom';

const About = () => (
  <section>
    <div className="container">
      <h2>About this App</h2>
      <p>
        This app was created to help archery federation and simplify tournaments management. Also it
        is a "multi-tool" for modern archery.
      </p>
      <p>Current functionality:</p>
      <ul>
        <li>Tournaments management</li>
        <li>Applications management</li>
        <li>Patrols management</li>
        <li>User management</li>
        <li>Rules management</li>
        <li>Universal converter</li>
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
        <li>And much more...</li>
      </ul>
      <hr />
      <p>
        Regarding additional functionality (or other questions) drop me an email to <br />
        <Link to="mailto:serhii.fedirko@gmail.com">serhii.fedirko@gmail.com</Link>
      </p>
      <hr />
      <p>
        © 2023{' '}
        <Link to="https://fedirko.pro" target="_blank">
          FEDIRKO.PRO
        </Link>
        . All rights reserved.
      </p>
    </div>
  </section>
);

export default About;
