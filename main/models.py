from datetime import datetime
from main import db


# @login_manager.user_loader
# def load_user(user_id):
#     return User.query.get(int(user_id))


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

    def __repr__(self):
        return f"Pill('{self.id}', '{self.pill_id}', '{self.name}', '{self.active_ingredient}', '{self.content}', '{self.images}'," \
            f"'{self.license}', '{self.packaging}', '{self.unit}', '{self.color}', '{self.shape}', '{self.link_images}'," \
            f"'{self.benefit}', '{self.dosage}', '{self.contraindication}', '{self.warning}', '{self.side_effect}', '{self.price}')"


class PillImages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pill_id = db.Column(db.String(20), db.ForeignKey('pill.id'), nullable=False)
    label = db.Column(db.String(200), nullable=True)
    image_url = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"PillImages('{self.id}', '{self.pill_id}', '{self.label}', '{self.image_url}', '{self.created_at}', '{self.deleted_at}')"
