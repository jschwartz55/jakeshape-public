import { SidebarSectionProps } from '../../../types/sidebarTypes';
import { NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const renderLinkContainer = (
  name: string,
  link: string,
  closeOffcanvas: () => void
) => (
  <LinkContainer to={link} key={link}>
    <NavDropdown.Item
      className='text-center nav-dropdown-style mt-0 pt-0'
      onClick={closeOffcanvas}
    >
      {name}
    </NavDropdown.Item>
  </LinkContainer>
);

const SidebarSection = ({
  title,
  linkDetails,
  closeOffcanvas,
}: SidebarSectionProps) => (
  <NavDropdown
    menuVariant='dark'
    title={title}
    className='border-bottom mb-5 mx-5 nav-dropdown-style'
  >
    {linkDetails.map((linkDetail) =>
      renderLinkContainer(linkDetail.name, linkDetail.link, closeOffcanvas)
    )}
  </NavDropdown>
);

export default SidebarSection;
