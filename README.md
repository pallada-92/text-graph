# Визуализация графа совстречаемости терминов в тексте.

Этот проект был создан с использованием [Create React App](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

Дипломный проект для [ИСИЭЗ НИУ ВШЭ](https://issek.hse.ru).

Автор: Ярослав Сергиенко.

## `Graph2dCanvas`

### Структура объекта для представления видимой области

```json
{
    "cx": 10,
    "cy": 15,
    "height": 20,
}
```

### Структура объекта для представления графа

```json
{
    "nodes": [{
        "text": "Алюминий",
        "fontSize": 20,
        "x": 10,
        "y": 20,
        "radius": 4,
        "color": "red",
        "style": "normal",
    }, {}, {}, {}],
    "edges": [{
        "source": 0,
        "target": 1,
        "weight": 3,
        "style": "normal",
    }, {}, {}, {}],
    "polygons": [{
        "color": "lightblue",
        "style": "normal",
        "vertices": [{
            "x": 3,
            "y": 5,
            "radius": 1,
            "style": "normal"
        }, {}, {}, {}]
    }, {}, {}, {}]
}
```
