import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Spin, message as antMessage } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography; 

const RegisterPage = () => {
  const [form] = Form.useForm();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }
    setError('');
    setLoading(true);
    try {
      const dbUserAfterSync = await signup(values.email, values.password, values.name);
      if (dbUserAfterSync) { // signup giờ trả về user từ DB (hoặc null nếu lỗi)
        antMessage.success('Đăng ký thành công! Đang chuyển hướng...');
        navigate('/home'); // Hoặc trang dashboard/profile
      } else {
        // Lỗi đã được xử lý và log trong AuthContext, có thể hiển thị thông báo chung hơn
        setError("Đăng ký hoặc đồng bộ hồ sơ thất bại. Vui lòng thử lại.");
      }
    } catch (firebaseError) {
      console.error("Firebase registration error caught in page:", firebaseError);
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng bởi tài khoản khác.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).');
      } else {
        setError('Đăng ký thất bại: ' + (firebaseError.message || "Lỗi không xác định."));
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <Title level={2} style={styles.title}>Tạo Tài Khoản Mới</Title>
        {error && <Alert message={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: '20px' }} />}
        <Form form={form} name="register" onFinish={onFinish} layout="vertical" autoComplete="off">
          <Form.Item
            name="name"
            label={<Text style={styles.label}>Tên hiển thị</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}
          >
            <Input size="large" placeholder="Ví dụ: John Doe" style={styles.input} />
          </Form.Item>
          <Form.Item
            name="email"
            label={<Text style={styles.label}>Email</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input size="large" placeholder="example@email.com" style={styles.input}/>
          </Form.Item>
          <Form.Item
            name="password"
            label={<Text style={styles.label}>Mật khẩu</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, {min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự.'}]}
            hasFeedback
          >
            <Input.Password size="large" placeholder="Ít nhất 6 ký tự" style={styles.input}/>
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={<Text style={styles.label}>Xác nhận mật khẩu</Text>}
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu" style={styles.input}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={styles.button}>
              Đăng Ký
            </Button>
          </Form.Item>
        </Form>
        <div style={styles.footerText}>
          Đã có tài khoản? <Link to="/login" style={styles.link}>Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7f7f7', padding: '20px', fontFamily: "'Nunito Sans', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '420px', padding: '30px 40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
    title: { textAlign: 'center', color: '#3c3c3c', fontWeight: 'bold', marginBottom: '30px' },
    label: { fontWeight: 'bold', color: '#586069', fontSize: '14px' },
    input: { borderRadius: '8px', borderColor: '#d0d7de' },
    button: { borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 0 rgba(0,0,0,0.045)' },
    footerText: { textAlign: 'center', marginTop: '25px', color: '#586069' },
    link: { color: '#1cb0f6', fontWeight: 'bold', textDecoration: 'none' }
};

export default RegisterPage;