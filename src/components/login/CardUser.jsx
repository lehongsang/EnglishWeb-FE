import React from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const CardUser = ({ logout }) => {
  const account = JSON.parse(localStorage.getItem("accessToken"));
  const UserName = account ? account.displayName : "";

  const menuItems = [
    {
      key: "1",
      label: (
        <Link to="/account">
          <span>Quản lý tài khoản</span>
        </Link>
      ),
    },
    {
      key: "3",
      danger: true,
      label: (
        <div type="link" onClick={logout}>Đăng xuất</div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
      >
        <Button style={{ maxWidth: 200 }}>
          <div data-tooltip={UserName} className="username">
            {UserName}
          </div>
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
};

export default CardUser;
