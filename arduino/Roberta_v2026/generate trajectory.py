import re

def extraire_points(texte):
    """Extraire les coordonnées des points à partir du texte."""
    pattern = r"move\(([^,]+),([^)]+)\);"
    points = re.findall(pattern, texte)
    return [(float(x), float(y)) for x, y in points]

def calculer_points_intermediaires(point1, point2, n):
    """Calculer les points intermédiaires entre deux points."""
    x1, y1 = point1
    x2, y2 = point2
    delta_x = (x2 - x1) / (n + 1)
    delta_y = (y2 - y1) / (n + 1)
    return [(x1 + i * delta_x, y1 + i * delta_y) for i in range(1, n + 1)]

def tourner_points_180(points):
    """Tourner les points de 180 degrés."""
    return [(-x, (-y + 260)/160*270) for x, y in points]

def generer_texte_points(points):
    """Générer le texte des points au format 'move(x,y);'."""
    return "\n".join([f"move({int(x)},{int(y)});" for x, y in points])

def ajouter_points_intermediaires(texte, n_intermediaires=1, tourner_180=False):
    """Ajouter des points intermédiaires à la liste de points."""
    points = extraire_points(texte)
    nouveaux_points = []

    for i in range(len(points) - 1):
        nouveaux_points.append(points[i])
        intermediaires = calculer_points_intermediaires(points[i], points[i + 1], n_intermediaires)
        nouveaux_points.extend(intermediaires)

    nouveaux_points.append(points[-1])

    if tourner_180:
        nouveaux_points = tourner_points_180(nouveaux_points)

    return generer_texte_points(nouveaux_points)

# Exemple d'utilisation
texte_points = """
move(-60,205);
move(-40,240);
move(0,260);
move(40,240);
move(60,210);
move(53,180);
move(26,170);
move(0,130);
move(0,100);
"""

n_intermediaires = 1  # Nombre de points intermédiaires à ajouter entre chaque paire de points
texte_resultat = ajouter_points_intermediaires(texte_points, n_intermediaires, tourner_180=True)
print(texte_resultat)
