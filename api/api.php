<?php

header('Access-Control-Allow-Origin: *'); 
header("Access-Control-Allow-Headers: origin, content-type, accept, authorization");
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

require_once 'serverSide.php';

// $query = "FROM SEMAD.SAIDA_MATERIAL S
//           INNER JOIN SEMAD.UNIDADE_ESTOQUE UE ON 
//             S.ID_UNIDADE_ESTOQUE = UE.ID_UNIDADE_ORG
//           INNER JOIN SEMAD.USUARIO U ON
//             U.ID_USUARIO = S.ID_USUARIO_CADASTRO
//           WHERE S.ID_UNIDADE_ESTOQUE = 5700
//         ";

$view = "SISPMM.V_PESSOA_PES";

echo serverSide::dataTable(file_get_contents("php://input"), $view);