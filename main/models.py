from datetime import datetime
from main import db, login_manager
from flask_login import UserMixin
import enum
from sqlalchemy.orm import relationship

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    image_file = db.Column(db.String(60), nullable=True, default='default.jpg')
    password = db.Column(db.String(60), nullable=False)
    admin = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_ip = db.Column(db.String(20), nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"User('{self.id}', '{self.name}', '{self.username}', '{self.email}', '{self.image_file}')"


class Labels(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    label = db.Column(db.String(20), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"Labels('{self.id}', '{self.name}', '{self.label}', '{self.created_at}')"


class Pill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pill_id = db.Column(db.String(45), nullable=True)
    name = db.Column(db.String(45), nullable=False)
    active_ingredient = db.Column(db.String(200), nullable=True)
    content = db.Column(db.String(200), nullable=True)
    license = db.Column(db.String(200), nullable=True)
    packaging = db.Column(db.String(200), nullable=True)
    unit = db.Column(db.String(200), nullable=True)
    color = db.Column(db.String(200), nullable=True)
    shape = db.Column(db.String(200), nullable=True)
    link_images = db.Column(db.String(200), nullable=True)
    benefit = db.Column(db.String(200), nullable=True)
    dosage = db.Column(db.String(200), nullable=True)
    contraindication = db.Column(db.String(200), nullable=True)
    warning = db.Column(db.String(200), nullable=True)
    side_effect = db.Column(db.String(200), nullable=True)
    price = db.Column(db.String(200), nullable=True)
    images = db.relationship('PillImages', backref="pill", lazy=True)
    created_by = db.Column(db.String(20), db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"Pill('{self.id}', '{self.pill_id}', '{self.name}', '{self.active_ingredient}', '{self.content}', '{self.images}'," \
            f"'{self.license}', '{self.packaging}', '{self.unit}', '{self.color}', '{self.shape}', '{self.link_images}'," \
            f"'{self.benefit}', '{self.dosage}', '{self.contraindication}', '{self.warning}', '{self.side_effect}', '{self.price}')"


class Types(enum.Enum):
    pill = 'pill'
    bill = 'bill'


class PillImages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pill_id = db.Column(db.String(20), db.ForeignKey('pill.id'), nullable=True)
    type = db.Column(db.Enum(Types), nullable=True, default=Types.pill)
    label = db.Column(db.String(200), nullable=True)
    image_url = db.Column(db.String(200), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"PillImages('{self.id}', '{self.pill_id}', '{self.type}', '{self.label}', '{self.image_url}', '{self.created_at}', '{self.deleted_at}')"


class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(50), nullable=True)
    img_path = db.Column(db.String(200), nullable=False)
    save = db.Column(db.Boolean, nullable=True, default=False)
    set_id = db.Column(db.Integer, db.ForeignKey('set.id'), nullable=True)
    created_by = db.Column(db.String(20), db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"Labels('{self.id}', '{self.img_path}', '{self.set_id}', '{self.description}', '{self.created_at}', '{self.created_by}')"

user_set = db.Table('user_set',
    db.Column('set_id', db.Integer, db.ForeignKey('set.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

class Set(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    img_path = db.Column(db.String(200), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=True)
    name = db.Column(db.String(200), nullable=False)
    pill_name = db.Column(db.String(2000), nullable=False)
    created_by = db.Column(db.String(20), db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    users = relationship("User", secondary=user_set)

    def __repr__(self):
        return f"Set('{self.id}', '{self.name}', '{self.img_path}', '{self.created_at}', '{self.created_by}')"

