import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Typography } from 'antd';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Sidebar from '../components/sidebar';
import app from '../firebase';

const { Title } = Typography;

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const db = getFirestore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Không thể xóa người dùng');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        ...values,
        updatedAt: new Date()
      });
      message.success('Cập nhật người dùng thành công');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Không thể cập nhật người dùng');
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tên hiển thị',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Vai trò',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin) => isAdmin === 1 ? 'Admin' : 'User',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '240px', padding: '20px', width: 'calc(100% - 240px)' }}>
        <Title level={2}>Quản lý người dùng</Title>
        
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
          />
        </Card>

        <Modal
          title="Chỉnh sửa người dùng"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Vui lòng nhập email' }]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              name="displayName"
              label="Tên hiển thị"
              rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="isAdmin"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Input type="number" min={0} max={1} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default Admin;
