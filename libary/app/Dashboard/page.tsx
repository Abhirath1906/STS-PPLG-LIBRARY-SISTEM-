"use client"
import "./style.css"
import { useState, useEffect } from "react";
import { SearchOutlined, PlusOutlined, BookOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Form, Button, Input, Modal, Select, DatePicker, Pagination } from "antd";
import dayjs from "dayjs";
import Header from "../Header/page";
import { useRouter } from "next/navigation";

const { Option } = Select;

const API_URL = "http://localhost:5000/api";
const ITEMS_PER_PAGE = 8;

export default function Dashboard() {
    const router = useRouter();


    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
    const [isBorrowBookModalOpen, setIsBorrowBookModalOpen] = useState(false);
    const [isEditBorrowModalOpen, setIsEditBorrowModalOpen] = useState(false);


    const [books, setBooks] = useState<any[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);


    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("SEMUA");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalSearchTerm, setModalSearchTerm] = useState("");
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [selectedBorrowBook, setSelectedBorrowBook] = useState<any>(null);

    const [addBookForm] = Form.useForm();
    const [editBookForm] = Form.useForm();
    const [borrowBookForm] = Form.useForm();
    const [editBorrowForm] = Form.useForm();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            router.push("/Login");
        } else {
            const userData = JSON.parse(user);
            setCurrentUser(userData);
            fetchBooks(userData.id);
            fetchBorrowed(userData.id);
        }
    }, [router]);

  
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);


    const fetchBooks = async (userId: number) => {
        try {
            const response = await fetch(`${API_URL}/book/${userId}`);
            const data = await response.json();

            if (data.success) {
                const transformedBooks = data.books.map((book: any) => ({
                    id: book.id,
                    title: book.name,
                    author: book.penulis,
                    status: book.category,
                    image: null,
                }));
                setBooks(transformedBooks);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };

    const fetchBorrowed = async (userId: number) => {
        try {
            const response = await fetch(`${API_URL}/peminjaman/${userId}`);
            const data = await response.json();

            if (data.success) {
                setBorrowedBooks(data.peminjaman);
            }
        } catch (error) {
            console.error("Error fetching borrowed books:", error);
        }
    };


    const filteredBooks = books.filter((book) => {
        const keyword = searchTerm.toLowerCase();
        const matchSearch =
            book.title.toLowerCase().includes(keyword) ||
            book.author.toLowerCase().includes(keyword);
        const matchFilter = filterType === "SEMUA" || book.status === filterType;
        return matchSearch && matchFilter;
    });

    const countFiksi = books.filter((book) => book.status === "Fiksi").length;
    const countNonFiksi = books.filter((book) => book.status === "Non-Fiksi").length;

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

  
    const filteredModalBooks = books.filter((book) => {
        const keyword = modalSearchTerm.toLowerCase();
        return (
            book.title.toLowerCase().includes(keyword) ||
            book.author.toLowerCase().includes(keyword)
        );
    });

    const handleAddBook = () => {
        setIsAddBookModalOpen(true);
    };

    const handleAddBookSubmit = async (values: any) => {
        if (!currentUser) return;

        try {
            const response = await fetch(`${API_URL}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.title,
                    penulis: values.author,
                    category: values.type,
                    user_id: currentUser.id,
                }),
            });
            const data = await response.json();

            if (data.success) {
                await fetchBooks(currentUser.id);
                addBookForm.resetFields();
                setIsAddBookModalOpen(false);
                alert("Buku berhasil ditambahkan!");
            } else {
                alert(data.message || "Gagal menambahkan buku!");
            }
        } catch (error) {
            console.error("Error adding book:", error);
            alert("Terjadi kesalahan saat menambahkan buku!");
        }
    };

    const handleEditBook = (book: any) => {
        setSelectedBook(book);
        editBookForm.setFieldsValue({
            title: book.title,
            author: book.author,
            type: book.status,
        });
        setIsEditBookModalOpen(true);
    };

    const handleEditBookSubmit = async (values: any) => {
        if (!currentUser || !selectedBook) return;

        try {
            const response = await fetch(`${API_URL}/book/${selectedBook.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.title,
                    penulis: values.author,
                    category: values.type,
                    user_id: currentUser.id,
                }),
            });
            const data = await response.json();

            if (data.success) {
                await Promise.all([fetchBooks(currentUser.id), fetchBorrowed(currentUser.id)]);
                editBookForm.resetFields();
                setIsEditBookModalOpen(false);
                setSelectedBook(null);
                alert("Buku berhasil diupdate!");
            } else {
                alert(data.message || "Gagal mengupdate buku!");
            }
        } catch (error) {
            console.error("Error updating book:", error);
            alert("Terjadi kesalahan saat mengupdate buku!");
        }
    };

    const handleDeleteBook = (bookId: number) => {
        if (!currentUser) return;

        Modal.confirm({
            title: "Hapus Buku",
            content: "Apakah kamu yakin ingin menghapus buku ini? Data peminjaman buku ini juga akan terhapus.",
            okText: "Ya, Hapus",
            cancelText: "Batal",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`${API_URL}/book/${bookId}/${currentUser.id}`, {
                        method: "DELETE",
                    });
                    const data = await response.json();

                    if (data.success) {
                        await Promise.all([fetchBooks(currentUser.id), fetchBorrowed(currentUser.id)]);
                        alert("Buku berhasil dihapus!");
                    } else {
                        alert(data.message || "Gagal menghapus buku!");
                    }
                } catch (error) {
                    console.error("Error deleting book:", error);
                    alert("Terjadi kesalahan saat menghapus buku!");
                }
            },
        });
    };


    const handleBorrowBook = () => {
        setIsBorrowBookModalOpen(true);
        setModalSearchTerm("");
    };

    const handleBorrowBookSubmit = async (values: any) => {
        if (!currentUser) return;

        try {
            const response = await fetch(`${API_URL}/peminjaman`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    book_id: values.bookId,
                    user_id: currentUser.id,
                    peminjam: values.borrowerName,
                    tenggat: values.dueDate.format("YYYY-MM-DD"),
                }),
            });
            const data = await response.json();

            if (data.success) {
                await fetchBorrowed(currentUser.id);
                borrowBookForm.resetFields();
                setIsBorrowBookModalOpen(false);
                setModalSearchTerm("");
                alert("Buku berhasil dipinjam!");
            } else {
                alert(data.message || "Gagal meminjam buku!");
            }
        } catch (error) {
            console.error("Error borrowing book:", error);
            alert("Terjadi kesalahan saat meminjam buku!");
        }
    };

    const isDueDatePassed = (dueDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    };

    const getDaysLate = (dueDate: string) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const due = new Date(dueDate).setHours(0, 0, 0, 0);
        return Math.floor((today - due) / (1000 * 3600 * 24));
    };

    const handleEditBorrow = (borrow: any) => {
        setSelectedBorrowBook(borrow);
        editBorrowForm.setFieldsValue({
            borrowerName: borrow.peminjam,
            bookTitle: borrow.title,
            dueDate: dayjs(borrow.tenggat),
        });
        setIsEditBorrowModalOpen(true);
    };

    const handleEditBorrowSubmit = async (values: any) => {
        if (!currentUser || !selectedBorrowBook) return;

        try {
            const response = await fetch(`${API_URL}/peminjaman/${selectedBorrowBook.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    peminjam: values.borrowerName,
                    tenggat: values.dueDate.format("YYYY-MM-DD"),
                    user_id: currentUser.id,
                }),
            });
            const data = await response.json();

            if (data.success) {
                await fetchBorrowed(currentUser.id);
                editBorrowForm.resetFields();
                setIsEditBorrowModalOpen(false);
                setSelectedBorrowBook(null);
                alert("Peminjaman berhasil diupdate!");
            } else {
                alert(data.message || "Gagal mengupdate peminjaman!");
            }
        } catch (error) {
            console.error("Error updating borrow:", error);
            alert("Terjadi kesalahan saat mengupdate peminjaman!");
        }
    };

    const handleDeleteBorrow = (borrowId: number) => {
        if (!currentUser) return;

        Modal.confirm({
            title: "Kembalikan Buku",
            content: "Apakah kamu yakin ingin mengembalikan buku ini?",
            okText: "Ya, Kembalikan",
            cancelText: "Batal",
            onOk: async () => {
                try {
                    const response = await fetch(`${API_URL}/peminjaman/${borrowId}/${currentUser.id}`, {
                        method: "DELETE",
                    });
                    const data = await response.json();

                    if (data.success) {
                        await fetchBorrowed(currentUser.id);
                        alert("Buku berhasil dikembalikan!");
                    } else {
                        alert(data.message || "Gagal mengembalikan buku!");
                    }
                } catch (error) {
                    console.error("Error returning book:", error);
                    alert("Terjadi kesalahan saat mengembalikan buku!");
                }
            },
        });
    };


    return (
        <>
            <Header />
            <section className="dashboard-section">
                <div className="dashboard-container">

                    <div className="dashboard-header">
                        <div className="header-text">
                            <h1 className="dashboard-title">Koleksi Terbuka</h1>
                            <p className="dashboard-subtitle">
                                Katalog referensi pustaka terkurasi. Peminjaman instan, penambahan arsip baru,
                                dan pelacakan tenggat baca dalam satu hamparan tenang.
                            </p>
                        </div>
                        <div className="header-actions">
                            <Button
                                className="btn-quick-borrow"
                                icon={<ClockCircleOutlined />}
                                onClick={handleBorrowBook}
                            >
                                PINJAM CEPAT
                            </Button>
                            <Button
                                className="btn-add-book"
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddBook}
                            >
                                TAMBAH BUKU BARU
                            </Button>
                        </div>
                    </div>

             
                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-label">TOTAL KOLEKSI TERDAFTAR</div>
                            <div className="stat-value">
                                <BookOutlined className="stat-icon" />
                                <span className="stat-number">{books.length}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">SEDANG DIPINJAM</div>
                            <div className="stat-value">
                                <BookOutlined className="stat-icon" />
                                <span className="stat-number">{borrowedBooks.length}</span>
                            </div>
                        </div>
                    </div>

               
                    {borrowedBooks.length > 0 && (
                        <div className="borrowed-books-section">
                            <div className="borrowed-header">
                                <div className="borrowed-title">BUKU SEDANG DIPINJAM</div>
                                <span className="borrowed-count">{borrowedBooks.length} Aktif</span>
                            </div>

                            <div className="borrowed-books-list">
                                {borrowedBooks.map((borrow) => {
                                    const isOverdue = isDueDatePassed(borrow.tenggat);
                                    return (
                                        <div key={borrow.id} className="borrowed-book-item">

                                            <div className="borrowed-book-info">
                                                <div className="borrowed-book-image">
                                                    <div className="borrowed-book-placeholder">
                                                        <BookOutlined style={{ fontSize: "32px", color: "#ccc" }} />
                                                    </div>
                                                </div>


                                                <div >
                                                    <div className="borrowed-book-title">{borrow.title}</div>
                                                    <div className="borrowed-book-author">{borrow.author}</div>
                                                    <div className="borrowed-book-date">
                                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                                            <ClockCircleOutlined style={{ fontSize: "12px" }} />
                                                            <span>
                                                                Tenggat:{" "}
                                                                {new Date(borrow.tenggat).toLocaleDateString("id-ID", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </span>
                                                            {isOverdue && (
                                                                <span className="overdue-badge">
                                                                    Telat {getDaysLate(borrow.tenggat)} hari
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>Peminjam: {borrow.peminjam}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="borrowed-book-actions">
                                                <Button
                                                    className="btn-edit-borrow"
                                                    onClick={() => handleEditBorrow(borrow)}
                                                >
                                                    EDIT
                                                </Button>
                                                <Button
                                                    className="btn-delete-borrow"
                                                    onClick={() => handleDeleteBorrow(borrow.id)}
                                                >
                                                    KEMBALIKAN
                                                </Button>
                                                {isOverdue && (
                                                    <div className="overdue-warning">Waktu peminjaman habis</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

               
                    <div className="search-filter-section">
                        <Input
                            className="search-input"
                            placeholder="Cari judul atau penulis buku..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <div className="filter-buttons">
                            <Button
                                className={filterType === "SEMUA" ? "filter-btn active" : "filter-btn"}
                                onClick={() => setFilterType("SEMUA")}
                            >
                                SEMUA ({books.length})
                            </Button>
                            <Button
                                className={filterType === "Fiksi" ? "filter-btn active" : "filter-btn"}
                                onClick={() => setFilterType("Fiksi")}
                            >
                                FIKSI ({countFiksi})
                            </Button>
                            <Button
                                className={filterType === "Non-Fiksi" ? "filter-btn active" : "filter-btn"}
                                onClick={() => setFilterType("Non-Fiksi")}
                            >
                                NON FIKSI ({countNonFiksi})
                            </Button>
                        </div>
                    </div>

          
                    <div className="books-grid">
                        {currentBooks.map((book) => (
                            <div key={book.id} className="book-card">
                                <div className="book-image">
                                    {book.image ? (
                                        <img src={book.image} alt={book.title} />
                                    ) : (
                                        <div className="book-placeholder">
                                            <BookOutlined style={{ fontSize: "48px", color: "#ccc" }} />
                                        </div>
                                    )}
                                </div>
                                <div className="book-info">
                                    <div className="book-type">{book.status}</div>
                                    <div className="book-title">{book.title}</div>
                                    <div className="book-author">{book.author}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                                    <Button onClick={() => handleEditBook(book)}>Edit</Button>
                                    <Button danger onClick={() => handleDeleteBook(book.id)}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredBooks.length === 0 && (
                        <p style={{ textAlign: "center", padding: "2rem 0", color: "#888" }}>
                            {books.length === 0
                                ? "Belum ada buku. Tambahkan buku pertamamu."
                                : "Tidak ada buku yang cocok dengan pencarian."}
                        </p>
                    )}


                </div>

              
                <Modal
                    title="Tambah Buku Baru"
                    open={isAddBookModalOpen}
                    onCancel={() => {
                        setIsAddBookModalOpen(false);
                        addBookForm.resetFields();
                    }}
                    footer={null}
                    width={600}
                    className="add-book-modal"
                >
                    <Form form={addBookForm} layout="vertical" onFinish={handleAddBookSubmit}>
                        <Form.Item
                            label="Nama Buku"
                            name="title"
                            rules={[{ required: true, message: "Masukkan nama buku!" }]}
                        >
                            <Input placeholder="Contoh: Laut Bercerita" />
                        </Form.Item>

                        <Form.Item
                            label="Tipe Buku"
                            name="type"
                            rules={[{ required: true, message: "Pilih tipe buku!" }]}
                        >
                            <Select placeholder="Pilih tipe buku">
                                <Option value="Fiksi">Fiksi</Option>
                                <Option value="Non-Fiksi">Non Fiksi</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Nama Penulis"
                            name="author"
                            rules={[{ required: true, message: "Masukkan nama penulis!" }]}
                        >
                            <Input placeholder="Contoh: Leila S. Chudori" />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <Button
                                    onClick={() => {
                                        setIsAddBookModalOpen(false);
                                        addBookForm.resetFields();
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Tambah Buku
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>

          
                <Modal
                    title="Edit Buku"
                    open={isEditBookModalOpen}
                    onCancel={() => {
                        setIsEditBookModalOpen(false);
                        editBookForm.resetFields();
                        setSelectedBook(null);
                    }}
                    footer={null}
                    width={600}
                    className="edit-book-modal"
                >
                    <Form form={editBookForm} layout="vertical" onFinish={handleEditBookSubmit}>
                        <Form.Item
                            label="Nama Buku"
                            name="title"
                            rules={[{ required: true, message: "Masukkan nama buku!" }]}
                        >
                            <Input placeholder="Contoh: Rongawi kuno" />
                        </Form.Item>

                        <Form.Item
                            label="Tipe Buku"
                            name="type"
                            rules={[{ required: true, message: "Pilih tipe buku!" }]}
                        >
                            <Select placeholder="Pilih tipe buku">
                                <Option value="Fiksi">Fiksi</Option>
                                <Option value="Non-Fiksi">Non Fiksi</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Nama Penulis"
                            name="author"
                            rules={[{ required: true, message: "Masukkan nama penulis!" }]}
                        >
                            <Input placeholder="Contoh: Ambaruwo" />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <Button
                                    onClick={() => {
                                        setIsEditBookModalOpen(false);
                                        editBookForm.resetFields();
                                        setSelectedBook(null);
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>

               
                <Modal
                    title="Pinjam Buku"
                    open={isBorrowBookModalOpen}
                    onCancel={() => {
                        setIsBorrowBookModalOpen(false);
                        borrowBookForm.resetFields();
                        setModalSearchTerm("");
                    }}
                    footer={null}
                    width={700}
                    className="borrow-book-modal"
                >
                    <Form form={borrowBookForm} layout="vertical" onFinish={handleBorrowBookSubmit}>
                        <Form.Item
                            label="Nama Peminjam"
                            name="borrowerName"
                            rules={[{ required: true, whitespace: true, message: "Masukkan nama peminjam!" }]}
                        >
                            <Input placeholder="Masukkan nama lengkap" />
                        </Form.Item>

                        <Form.Item label="Cari Buku">
                            <Input
                                placeholder="Cari judul atau penulis buku..."
                                prefix={<SearchOutlined />}
                                value={modalSearchTerm}
                                onChange={(e) => setModalSearchTerm(e.target.value)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Pilih Buku"
                            name="bookId"
                            rules={[{ required: true, message: "Pilih buku yang akan dipinjam!" }]}
                        >
                            <Select placeholder="Pilih buku" showSearch filterOption={false}>
                                {filteredModalBooks.map((book) => (
                                    <Option key={book.id} value={book.id}>
                                        {book.title} ({book.author})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Tenggat Pengembalian"
                            name="dueDate"
                            rules={[{ required: true, message: "Tentukan tenggat pengembalian!" }]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                placeholder="Pilih tanggal pengembalian"
                                format="DD/MM/YYYY"
                                disabledDate={(current) => current && current.isBefore(dayjs().startOf("day"))}
                            />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <Button
                                    onClick={() => {
                                        setIsBorrowBookModalOpen(false);
                                        borrowBookForm.resetFields();
                                        setModalSearchTerm("");
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Pinjam Buku
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>

             
                <Modal
                    title="Edit Peminjaman Buku"
                    open={isEditBorrowModalOpen}
                    onCancel={() => {
                        setIsEditBorrowModalOpen(false);
                        editBorrowForm.resetFields();
                        setSelectedBorrowBook(null);
                    }}
                    footer={null}
                    width={600}
                    className="edit-borrow-modal"
                >
                    <Form form={editBorrowForm} layout="vertical" onFinish={handleEditBorrowSubmit}>
                        <Form.Item label="Judul Buku" name="bookTitle">
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            label="Nama Peminjam"
                            name="borrowerName"
                            rules={[{ required: true, whitespace: true, message: "Masukkan nama peminjam!" }]}
                        >
                            <Input placeholder="Masukkan nama lengkap" />
                        </Form.Item>

                        <Form.Item
                            label="Tenggat Pengembalian"
                            name="dueDate"
                            rules={[{ required: true, message: "Tentukan tenggat pengembalian!" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <Button
                                    onClick={() => {
                                        setIsEditBorrowModalOpen(false);
                                        editBorrowForm.resetFields();
                                        setSelectedBorrowBook(null);
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </section>
        </>
    );
}