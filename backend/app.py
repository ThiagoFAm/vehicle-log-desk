from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib

app = Flask(__name__)
CORS(app)

# --- Função de hash simples ---
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# --- Criação das tabelas ---
def init_db():
    conn = sqlite3.connect('vehicles.db')
    c = conn.cursor()

    # Tabela de veículos
    c.execute('''
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            ramal INTEGER NOT NULL,
            setor TEXT NOT NULL,
            plate TEXT NOT NULL,
            model TEXT NOT NULL,
            cor TEXT NOT NULL
        )
    ''')

    # Tabela de usuários
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()

# --- Inicializa o banco ---
init_db()

# ===========================
# ROTAS DE AUTENTICAÇÃO
# ===========================

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    fullname = data.get("fullname")
    email = data.get("email")
    password = hash_password(data.get("password"))

    conn = sqlite3.connect("vehicles.db")
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
                  (fullname, email, password))
        conn.commit()
        return jsonify({"message": "Usuário criado com sucesso"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "E-mail já registrado"}), 400
    finally:
        conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = hash_password(data.get("password"))

    conn = sqlite3.connect("vehicles.db")
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
    user = c.fetchone()
    conn.close()

    if user:
        return jsonify({
            "message": "Login bem-sucedido",
            "user": {"id": user[0], "fullname": user[1], "email": user[2]}
        }), 200
    else:
        return jsonify({"error": "Credenciais inválidas"}), 401


# ===========================
# ROTAS DE VEÍCULOS
# ===========================

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    conn = sqlite3.connect('vehicles.db')
    c = conn.cursor()
    c.execute('SELECT * FROM vehicles')
    vehicles = [
        {
            'id': row[0],
            'name': row[1],
            'ramal': row[2],
            'setor': row[3],
            'plate': row[4],
            'model': row[5],
            'cor': row[6]
        }
        for row in c.fetchall()
    ]
    conn.close()
    return jsonify(vehicles)


@app.route('/api/vehicles', methods=['POST'])
def add_vehicle():
    data = request.json
    conn = sqlite3.connect('vehicles.db')
    c = conn.cursor()
    cor_value = data.get('cor') or data.get('color')
    c.execute(
        'INSERT INTO vehicles (name, ramal, setor, plate, model, cor) VALUES (?, ?, ?, ?, ?, ?)',
        (data.get('name'), data.get('ramal'), data.get('setor'),
         data.get('plate'), data.get('model'), cor_value)
    )
    conn.commit()
    vehicle_id = c.lastrowid
    c.execute('SELECT * FROM vehicles WHERE id = ?', (vehicle_id,))
    vehicle = c.fetchone()
    conn.close()
    
    return jsonify({
        'id': vehicle[0],
        'name': vehicle[1],
        'ramal': vehicle[2],
        'setor': vehicle[3],
        'plate': vehicle[4],
        'model': vehicle[5],
        'cor': vehicle[6]
    }), 201


@app.route('/api/vehicles/<int:id>', methods=['PUT'])
def update_vehicle(id):
    data = request.json
    conn = sqlite3.connect('vehicles.db')
    c = conn.cursor()

    if 'color' in data and 'cor' not in data:
        data['cor'] = data.get('color')

    updates = []
    values = []
    for key in ['name', 'ramal', 'setor', 'plate', 'model', 'cor']:
        if key in data:
            updates.append(f'{key} = ?')
            values.append(data[key])

    if updates:
        values.append(id)
        query = f'UPDATE vehicles SET {", ".join(updates)} WHERE id = ?'
        c.execute(query, values)
        conn.commit()

    c.execute('SELECT * FROM vehicles WHERE id = ?', (id,))
    vehicle = c.fetchone()
    conn.close()

    if vehicle:
        return jsonify({
            'id': vehicle[0],
            'name': vehicle[1],
            'ramal': vehicle[2],
            'setor': vehicle[3],
            'plate': vehicle[4],
            'model': vehicle[5],
            'cor': vehicle[6]
        })
    return jsonify({'error': 'Vehicle not found'}), 404


@app.route('/api/vehicles/<int:id>', methods=['DELETE'])
def delete_vehicle(id):
    conn = sqlite3.connect('vehicles.db')
    c = conn.cursor()
    c.execute('DELETE FROM vehicles WHERE id = ?', (id,))
    conn.commit()
    deleted = c.rowcount > 0
    conn.close()
    
    if deleted:
        return jsonify({'message': 'Vehicle deleted'})
    return jsonify({'error': 'Vehicle not found'}), 404


# ===========================
# EXECUÇÃO
# ===========================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
