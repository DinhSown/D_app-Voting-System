# ⬡ VoteChain — DApp Bình Chọn trên Blockchain

Hệ thống bình chọn phi tập trung xây dựng trên Ethereum Blockchain, sử dụng Solidity + Hardhat + React + Node.js + MySQL.
## Đã đến Bước 4
---

## 📁 Cấu trúc thư mục

```
dapp-voting-system/
├── blockchain/              # Smart contract (Solidity + Hardhat)
│   ├── contracts/
│   │   └── Voting.sol       # Smart contract chính
│   ├── scripts/
│   │   └── deploy.js        # Script deploy tự động
│   ├── test/
│   │   └── Voting.test.js   # 12 unit tests
│   └── hardhat.config.js
│
├── backend/                 # API Server (Node.js + Express)
│   └── src/
│       ├── config/
│       │   ├── database.js  # MySQL pool
│       │   └── migrate.js   # Tự động tạo bảng + seed admin
│       ├── controllers/     # adminController, votingController, ...
│       ├── middleware/
│       │   └── auth.js      # JWT middleware
│       ├── routes/
│       │   └── index.js     # Tất cả API routes
│       └── index.js         # Express app entry
│
├── frontend/                # React App (Vite)
│   └── src/
│       ├── context/
│       │   ├── Web3Context.jsx   # MetaMask + ethers.js
│       │   └── AuthContext.jsx   # Admin auth
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── VotingsPage.jsx
│       │   ├── VotingDetailPage.jsx
│       │   ├── VotePage.jsx      # Trang bỏ phiếu chính
│       │   ├── ResultsPage.jsx   # Kết quả live từ blockchain
│       │   └── admin/
│       │       ├── AdminLoginPage.jsx
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminVotings.jsx
│       │       ├── AdminVotingForm.jsx
│       │       ├── AdminCandidates.jsx
│       │       └── AdminTransactions.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── UI.jsx            # Shared components
│       └── utils/
│           ├── api.js            # Axios instance
│           └── helpers.js        # Utilities
│
└── docs/                    # Tài liệu
```

---

## ⚡ Hướng dẫn cài đặt và chạy

### Yêu cầu
- Node.js >= 18
- MySQL >= 8
- MetaMask (extension trình duyệt)
- Git

---

### Bước 1: Cài đặt dependencies

```bash
# Clone hoặc giải nén project
cd dapp-voting-system

# Cài tất cả packages
cd blockchain && npm install
cd ../backend  && npm install
cd ../frontend && npm install
```

---

### Bước 2: Cấu hình backend

```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
```

---

### Bước 3: Tạo database

```bash
cd backend
npm run migrate
# → Tự động tạo DB, tất cả bảng, và tài khoản admin mặc định
# → Admin: admin / Admin@123456
```

---

### Bước 4: Khởi động Hardhat local blockchain

```bash
# Terminal 1

npx hardhat node
# → Local RPC: http://127.0.0.1:8545
# → Bạn sẽ thấy 20 ví test với 10000 ETH mỗi ví
```

---

### Bước 5: Deploy smart contract

```bash
# Terminal 2
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
# → Contract được deploy
# → ABI + contractAddress tự động copy vào frontend/src/utils/contractConfig.json
```

---

### Bước 6: Copy contractConfig sang public folder (cho VotePage đọc)

```bash
cd frontend
cp src/utils/contractConfig.json public/contractConfig.json
```

---

### Bước 7: Khởi động backend

```bash
# Terminal 3
cd backend
npm run dev
# → API chạy tại http://localhost:5000
```

---

### Bước 8: Khởi động frontend

```bash
# Terminal 4
cd frontend
npm run dev
# → App chạy tại http://localhost:5173
```

---

### Bước 9: Cấu hình MetaMask

1. Mở MetaMask → Thêm mạng mới:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Symbol:** ETH

2. Import ví test: Lấy private key từ output `npx hardhat node` (ví đầu tiên)

---

## 🔐 API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | /api/admin/login | ❌ | Đăng nhập admin |
| GET | /api/admin/profile | ✅ | Thông tin admin |
| GET | /api/votings | ❌ | Danh sách bình chọn |
| POST | /api/votings | ✅ | Tạo bình chọn |
| GET | /api/votings/:id | ❌ | Chi tiết bình chọn |
| PUT | /api/votings/:id | ✅ | Cập nhật |
| DELETE | /api/votings/:id | ✅ | Xóa |
| GET | /api/votings/:id/candidates | ❌ | Danh sách ứng viên |
| POST | /api/votings/:id/candidates | ✅ | Thêm ứng viên |
| PUT | /api/candidates/:id | ✅ | Sửa ứng viên |
| DELETE | /api/candidates/:id | ✅ | Xóa ứng viên |
| GET | /api/votings/:id/results | ❌ | Kết quả (DB) |
| GET | /api/votings/:id/transactions | ❌ | Log giao dịch |
| POST | /api/transactions | ❌ | Ghi nhận tx sau vote |
| POST | /api/sync/:votingId | ✅ | Đồng bộ từ blockchain |

---

## 🧪 Chạy tests smart contract

```bash
cd blockchain
npx hardhat test
```

**Test cases:**
- ✅ Vote thành công và emit event
- ✅ Vote lần 2 bị từ chối (đã vote rồi)
- ✅ Vote candidate không tồn tại → revert
- ✅ Vote khi voting chưa mở → revert
- ✅ Vote sau khi đã đóng → revert
- ✅ Chỉ owner được start/end voting
- ✅ Kết quả và tổng phiếu đúng

---

## 🚨 Lưu ý quan trọng

> **Giới hạn của mô hình:** Hệ thống đảm bảo **mỗi địa chỉ ví chỉ bỏ phiếu một lần**, không đảm bảo mỗi **người thật** chỉ vote một lần (không có KYC). Đây là đặc điểm của DApp dạng này.

---

## 🌐 Deploy production

- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway / VPS
- **Database:** PlanetScale / Railway MySQL
- **Blockchain:** Sepolia Testnet (đổi `SEPOLIA_RPC_URL` trong `.env`)

---

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.19, Hardhat |
| Frontend | React 18, Vite, ethers.js v6 |
| Backend | Node.js, Express |
| Database | MySQL 8 |
| Auth | JWT + bcryptjs |
| Wallet | MetaMask, ethers.BrowserProvider |
