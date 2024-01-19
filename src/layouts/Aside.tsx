import { styled, List, ListItem as MuiListItem } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { path: "/inbound", name: "입고" },
  { path: "/outbound", name: "출고" },
  { path: "/inventory", name: "재고" },
  { path: "/outbounds", name: "출고리스트" },
  { path: "/products", name: "상품리스트" },
];
function Aside() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const handleClick = (path: string) => () => {
    navigate(path);
  };

  return (
    <Wrapper>
      <Logo src={"/logo.png"} alt="logo" />

      <Strong>{`에코프리미어\n재고관리 시스템`}</Strong>

      <List>
        {MENU_ITEMS.map(({ path, name }, index) => (
          <ListItem
            selected={pathname === path}
            key={index}
            onClick={handleClick(path)}
          >
            {name}
          </ListItem>
        ))}
      </List>
    </Wrapper>
  );
}

const Wrapper = styled("aside")`
  display: flex;
  flex-direction: column;
  padding: 15px 30px 30px 30px;
  flex: 0 0 250px;
  background-color: #f4f4f4;
  border-right: 1px solid #eeeeee;
`;

const Logo = styled("img")`
  width: 180px;
  height: auto;
  margin-bottom: 20px;
`;

const Strong = styled("strong")`
  font-size: 14px;
  white-space: pre;
  margin-bottom: 60px;
  font-weight: 600;
  color: #424242;
`;

const ListItem = styled(MuiListItem)`
  font-size: 17px;
  padding: 10px 0;
  cursor: pointer;

  &.Mui-selected {
    background: unset;
    font-weight: bold;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

export default Aside;
