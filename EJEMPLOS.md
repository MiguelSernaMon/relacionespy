# Ejemplos de archivos para probar la aplicación

## Archivo de ejemplo: planilla_madre.csv
```csv
identificationPatient;idOrder;otherColumn1;otherColumn2
12345678;1001;Juan Perez;Activo
87654321;1002;Maria Garcia;Activo
11111111;1003;Carlos Lopez;Inactivo
22222222;1004;Ana Martinez;Activo
```

## Archivo de ejemplo: planilla_ofimatic.csv
```csv
Linea basura 1
Linea basura 2  
Linea basura 3
Linea basura 4
nit,Nrodcto,descripcion,estado
12345678,REL001,Relacion Tipo A,Pendiente
87654321,REL002,Relacion Tipo B,Completado
11111111,REL003,Relacion Tipo C,Pendiente
33333333,REL004,Relacion Tipo D,Sin Match
```

## Resultado esperado: archivo_combinado.csv
```csv
nit,Nrodcto,descripcion,estado
12345678,REL001-1001,Relacion Tipo A,Pendiente
87654321,REL002-1002,Relacion Tipo B,Completado
11111111,REL003-1003,Relacion Tipo C,Pendiente
33333333,REL004-,Relacion Tipo D,Sin Match
```

**Nota:** El último registro (33333333) no tiene match en la planilla madre, por lo que su `Nrodcto` queda como `REL004-` (sin idOrder).