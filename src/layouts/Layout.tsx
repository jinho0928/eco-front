import { ReactNode } from "react";
import { styled } from "@mui/material";
import { Aside } from ".";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  children: ReactNode;
}

function Layout({ title, children }: Props) {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/login");
  };
  
  return (
    <>
      <Aside />
      <Wrapper>
        <Header>
          <strong>{title}</strong>
          <span onClick={handleLogout}>로그아웃</span>
        </Header>

        {children}
      </Wrapper>
    </>
  );
}

export default Layout;

const Wrapper = styled("main")`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 20px;
  overflow: hidden;
`;

const Header = styled("header")`
  display: flex;
  justify-content: space-between;
  padding: 30px 0 20px 0;

  > strong {
    font-size: 24px;
  }

  > span {
    display: flex;
    align-items: center;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
`;
