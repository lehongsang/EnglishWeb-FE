import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert, message as antMessage } from 'antd'; // Thêm Antd components
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm(); // Sử dụng Antd Form
  const { login } = useAuth();    // Lấy hàm login từ context
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values) => { // Đổi tên hàm cho Antd Form
    setError("");
    setLoading(true);
    try {
      await login(values.email, values.password); // Gọi hàm login từ context
      // onAuthStateChanged trong AuthContext sẽ xử lý việc đồng bộ và cập nhật currentUserDb
      antMessage.success('Đăng nhập thành công!');
      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error in LoginPage:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Email hoặc mật khẩu không chính xác.");
      } else if (err.code === "auth/invalid-email") {
        setError("Địa chỉ email không hợp lệ.");
      } else if (err.code === 'auth/too-many-requests') {
        setError('Quá nhiều lần thử không thành công. Tài khoản của bạn có thể tạm thời bị khóa. Vui lòng thử lại sau.');
      }else {
        setError(`Lỗi đăng nhập: ${err.message || "Đã có lỗi xảy ra."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng lại styles từ RegisterPage hoặc tạo styles riêng
  const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: "'Nunito Sans', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '420px', padding: '30px 40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
    title: { textAlign: 'center', color: '#3c3c3c', fontWeight: 'bold', marginBottom: '30px' },
    label: { fontWeight: 'bold', color: '#586069', fontSize: '14px' },
    input: { borderRadius: '8px', borderColor: '#d0d7de' },
    button: { borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 0 rgba(0,0,0,0.045)' },
    footerText: { textAlign: 'center', marginTop: '25px', color: '#586069' },
    link: { color: '#1cb0f6', fontWeight: 'bold', textDecoration: 'none' }
  };

  return (
    <div style={styles.container}>
       <div style={styles.formWrapper}>
        <Title level={2} style={styles.title}>Đăng Nhập</Title>
        {error && <Alert message={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: '20px' }} />}
        <Form form={form} name="login" onFinish={onFinish} layout="vertical" autoComplete="off">
          <Form.Item
            name="email"
            label={<Text style={styles.label}>Email</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input size="large" placeholder="example@email.com" style={styles.input} />
          </Form.Item>
          <Form.Item
            name="password"
            label={<Text style={styles.label}>Mật khẩu</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password size="large" placeholder="Mật khẩu của bạn" style={styles.input} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={styles.button}>
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </Form.Item>
        </Form>
        <div style={{textAlign: 'right', fontSize: '13px', marginBottom: '20px'}}>
          <Link to="/forgot-password" style={styles.link}>Quên mật khẩu?</Link>
        </div>
        <div style={styles.footerText}>
          Chưa có tài khoản? <Link to="/register" style={styles.link}>Tạo tài khoản mới</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;