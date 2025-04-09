import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} London Public Library. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
