<?php

use Rector\Set\ValueObject\DowngradeLevelSetList;
use Rector\Config\RectorConfig;

return function ( RectorConfig $rectorConfig ): void {
	$rectorConfig->sets( array( DowngradeLevelSetList::DOWN_TO_PHP_80 ) );
};
