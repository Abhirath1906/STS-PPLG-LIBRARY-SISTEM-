"use client"
import "./styles.css"
import { UserOutlined, BookFilled, LogoutOutlined } from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
    const router = useRouter();
    const [username, setUsername] = useState("Guest");

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUsername(userData.username);
        }
    }, []);

    const handleLogout = () => {
        Modal.confirm({
            title: 'Logout',
            content: 'Apakah kamu yakin ingin logout?',
            okText: 'Ya, Logout',
            cancelText: 'Batal',
            onOk: () => {
                localStorage.removeItem('user');
                message.success('Logout berhasil!');
                router.push('/Login');
            }
        });
    };

    return (
        <section>
            <section className="The-Header-Section">
                <div className="Div-Left-Header">
                    <BookFilled className="The-Header-Icon" />
                    <div className="The-Title-Text-Header">Library</div>
                </div>

                <div className="Div-Right-header">
                    <div className="The-Right-User-Header-Mb">{username}</div>

                    <div className="The-Line"></div>

                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ color: "#466558" }}
                    >
                        Logout
                    </Button>
                </div>
            </section>





            <section className="The-Header-Section-Mb">
                <div className="Div-Left-Header-Mb">
                    <BookFilled className="The-Header-Icon-Mb" />
                    <div className="The-Title-Text-Header-Mb">Library</div>
                </div>

                <div className="Div-Right-header-Mb">
                    <div className="The-Right-User-Header-Mb">{username}</div>

                    <div className="The-Line-Mb"></div>

                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{ color: "#466558" }}
                    >
                        Logout
                    </Button>
                </div>
            </section>

        </section>
    );
}