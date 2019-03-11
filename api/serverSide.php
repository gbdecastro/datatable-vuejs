<?php

require_once 'oracle/db.php';

class serverSide{

    private static function paginate($request)
    {
        $request = json_decode($request,true);

        $f = (int) $request['initial'] * (int) $request['lengthPage'];

        $i = ((int) $request['initial'] * (int) $request['lengthPage']) - (int) $request['lengthPage'] + 1;

        $paginate = "WHERE RN BETWEEN {$i} AND {$f}";        

        return [
            'sql' => $paginate
        ];

    }

    private static function order($request)
    {
        $request = json_decode($request,true);
        $sql = [];
        $order = "";
        foreach ($request['columns'] as $key => $value) {
            if( is_bool($value['sortable']) ){
                if( $value['ordering'] != 'not'){
                    $sql[] = $value['field'];
                    $order = $value['ordering'];
                }
            }
        }

        if ($sql = [])
            $sql = "";            

        return [
            "sql" => implode(",",$sql),
            "order" =>  $order
        ];

    }

    private static function columns($request)
    {
        $request = json_decode($request,true);
        $sql = [];
        foreach ($request['columns'] as $key => $value) {
            $sql[] = $value['field'];
        }

        return implode(",",$sql);        
    }

    private static function filter($request)
    {
        $request = json_decode($request,true);

        $fields = [];
        $values = [];
        $sql = "";
        
        $countConditions = 0;


        for ($i=0; $i < count($request['filter'][0]); $i++) { 
            //nomes dos fields
            $fields[] = $request['filter'][0][$i];

            if(!empty($request['filter'][1])){
                //valores dos fields
                $values[] = $request['filter'][1][$i];

                if($request['filter'][1][$i] != null && $request['filter'][1][$i] != '' && !empty($request['filter'][1][$i])){
                    if($countConditions==0)
                        $sql .= " WHERE UPPER(".$request['filter'][0][$i].") LIKE UPPER('%".$request['filter'][1][$i]."%')";        
                    else
                        $sql .= " AND UPPER(".$request['filter'][0][$i].") LIKE UPPER('%".$request['filter'][1][$i]."%')";
                    $countConditions++;
                }
            }

        }

        return [
            'fields' => implode(",",$fields),
            'values' => implode(",",$values),
            'sql'   =>  $sql
        ];

    }


    public static function dataTable($request, $view)
    {
        $db = DB::getInstance();

        //ordernação
        //$order = self::order($request);

        //colunas
        $columns = self::columns($request);

        //condições
        $where  = self::filter($request);

        //paginação
        $paginate = self::paginate($request);        

        $query = "SELECT COUNT(*) AS QTD FROM {$view} {$where['sql']}";

        $total = $db->query($query)->fetch()['QTD'];

        $sql = "SELECT * FROM (
            SELECT
                V.*,
                ROW_NUMBER() OVER (ORDER BY {$columns} ASC) RN
            FROM {$view} v
            {$where['sql']}
        ){$paginate['sql']}";

        $response = [
            'data' => $db->query($sql)->fetchAll(),
            'total' => $total
        ];

        return json_encode($response);

    }
}