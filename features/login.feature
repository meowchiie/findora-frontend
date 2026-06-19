Feature: Login Pengguna di Portal Lost & Found ITH

  Background:
    Given Pengguna membuka halaman login

  Scenario: Login berhasil dengan kredensial yang valid
    When Pengguna memasukkan email "testing123@gmail.com"
    And Pengguna memasukkan kata sandi "testing123"
    And Pengguna menekan tombol "MASUK"
    Then Pengguna harus dialihkan ke halaman "/dashboard"
    And Token autentikasi harus tersimpan di localStorage

  Scenario Outline: Gagal login karena validasi frontend (Client-side)
    When Pengguna memasukkan email "<email>"
    And Pengguna memasukkan kata sandi "<password>"
    And Pengguna menekan tombol "MASUK"
    Then Pengguna harus melihat pesan error "<pesan_error>"

    Examples:
  | email                       | password    | pesan_error                   |
  |                             | password123 | Email wajib diisi             |
  | testing123alkfjl@gmail.com  | password123 | User tidak ditemukan!         |
  | user@ith.ac.id              |             | Password wajib diisi          |
  | user@ith.ac.id              | 123         | Password minimal 8 karakter   |

  Scenario: Gagal login karena kredensial salah dari server (Backend)
    When Pengguna memasukkan email "testing123@gmail.com"
    And Pengguna memasukkan kata sandi "testing1234"
    And Pengguna menekan tombol "MASUK"
    Then Pengguna harus melihat pesan error "Password salah!"