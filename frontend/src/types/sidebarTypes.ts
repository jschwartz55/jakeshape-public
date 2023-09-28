export type LinkDetails = {
  name: string;
  link: string;
};

export type SidebarSectionProps = {
  title: string;
  linkDetails: LinkDetails[];
  closeOffcanvas: () => void;
};
