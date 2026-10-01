"use client"
import { UserOutlined, MailOutlined, LockOutlined, RightOutlined } from "@ant-design/icons";
import { Form, Button, Input, message } from "antd";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const handleRegister = async (values: any) => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password
        })
      });

      const data = await response.json();

      if (data.success) {
        message.success('Registrasi berhasil! Silakan login.');
        form.resetFields();


        router.push('/Login');

      } else {
        message.error(data.message || 'Registrasi gagal!');
      }
    } catch (error) {
      console.error('Register error:', error);
      message.error('Terjadi kesalahan. Pastikan backend server berjalan!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="The-Section-Register">
      <div className="The-Container-Register">
        <div className="The-All-in-Register">
          <div style={{ marginTop: "2vw", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3vw", alignItems: "center" }}>
              <div><UserOutlined className="The-Icon" /></div>
              <div style={{ fontSize: "clamp(16px, 2vw, 24px)", color: "#3A6755", letterSpacing: "1px" }}>THE LIBRARY</div>
            </div>

            <div style={{ fontSize: "clamp(18px, 2vw, 28px)", color: "black" }}>Register</div>

            <div className="Div-Form">
              <Form form={form} onFinish={handleRegister}>
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: "Please type the username" },
                    { min: 3, message: "Username must be at least 3 characters" }
                  ]}
                >
                  <div className="Div-Input">
                    <div style={{ color: "#171D1A" }}>Username</div>
                    <Input
                      className="The-Input"
                      prefix={<UserOutlined />}
                      placeholder="Example: cihuy123"
                    />
                  </div>
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please type the email" },
                    { type: "email", message: "Please enter a valid email" }
                  ]}
                >
                  <div className="Div-Input">
                    <div style={{ color: "#171D1A" }}>Email</div>
                    <Input
                      className="The-Input"
                      prefix={<MailOutlined />}
                      placeholder="name@gmail.com"
                    />
                  </div>
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please type the password" },
                  ]}
                >
                  <div className="Div-Input">
                    <div style={{ color: "#171D1A" }}>Password</div>
                    <Input.Password
                      className="The-Input"
                      prefix={<LockOutlined />}
                      placeholder="*****"
                    />
                  </div>
                </Form.Item>

                <div className="Div-Button">
                  <Button
                    className="The-Button"
                    htmlType="submit"
                    loading={loading}
                  >
                    Register <RightOutlined />
                  </Button>

                  <Link className="The-Link" href="/Login">Already have account?</Link>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}