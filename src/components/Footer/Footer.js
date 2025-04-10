import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <span>
        © {new Date().getFullYear()} Forest City Volunteers. All Rights
        Reserved.
      </span>
    </footer>
  );
};

export default Footer;
